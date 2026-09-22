const REQUEST_TYPE = "YOUTUBE_SHELF_DATA_REQUEST";

function abortError() {
  return new DOMException("The operation was aborted", "AbortError");
}

function serializedBody(body) {
  if (body === undefined || body === null) return "";
  if (typeof body === "string") return body;
  if (body instanceof URLSearchParams) return body.toString();
  throw new TypeError("The shared YouTube request channel only accepts text request bodies");
}

function requestHeaders(input, options) {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(options.headers || {}).forEach((value, name) => headers.set(name, value));
  return Object.fromEntries(headers.entries());
}

function createLocalRequestLane(fetchImpl, concurrency) {
  const queue = [];
  let running = 0;
  let lastStartedAt = 0;
  let pumpTimer = 0;

  function pump() {
    clearTimeout(pumpTimer);
    pumpTimer = 0;
    const limit = Math.max(1, Math.min(3, Number(concurrency()) || 1));
    if (!queue.length || running >= limit) return;
    const delay = Math.max(0, lastStartedAt + 150 - Date.now());
    if (delay) {
      pumpTimer = setTimeout(pump, delay);
      return;
    }
    const queued = queue.shift();
    running++;
    lastStartedAt = Date.now();
    fetchImpl(queued.input, queued.options)
      .then(queued.resolve, queued.reject)
      .finally(() => {
        running = Math.max(0, running - 1);
        pump();
      });
    pump();
  }

  return (input, options) => new Promise((resolve, reject) => {
    queue.push({ input, options, resolve, reject });
    pump();
  });
}

export function createYoutubeRequestClient({ runtime, fetchImpl = fetch, concurrency = () => 1 } = {}) {
  const localRequest = createLocalRequestLane(fetchImpl, concurrency);
  let brokerUnavailable = !runtime?.sendMessage;
  return async function youtubeRequest(input, options = {}) {
    if (options.signal?.aborted) throw abortError();
    if (brokerUnavailable) return localRequest(input, options);

    const url = input instanceof Request ? input.url : String(input);
    const method = String(options.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    const message = {
      type: REQUEST_TYPE,
      url,
      method,
      headers: requestHeaders(input, options),
      body: serializedBody(options.body),
      cache: options.cache === "force-cache" ? "force-cache" : "no-store",
      concurrency: Math.max(1, Math.min(3, Number(concurrency()) || 1))
    };

    const responsePromise = Promise.resolve(runtime.sendMessage(message)).then((result) => {
      if (!result) {
        brokerUnavailable = true;
        return localRequest(input, options);
      }
      if (!result.transportOk) {
        const error = new Error(result.error || "Shared YouTube request failed");
        error.youtubeBrokerResponse = true;
        throw error;
      }
      return new Response(result.body || "", {
        status: result.status,
        statusText: result.statusText || "",
        headers: result.headers || {}
      });
    }).catch((error) => {
      if (error?.youtubeBrokerResponse || error?.name === "AbortError" || options.signal?.aborted) throw error;
      brokerUnavailable = true;
      return localRequest(input, options);
    });
    if (!options.signal) return responsePromise;
    return Promise.race([
      responsePromise,
      new Promise((_, reject) => options.signal.addEventListener("abort", () => reject(abortError()), { once: true }))
    ]);
  };
}
