//#region node_modules/@tanstack/query-core/build/modern/timeoutManager.js
var defaultTimeoutProvider = {
	setTimeout: (callback, delay) => setTimeout(callback, delay),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId),
	setInterval: (callback, delay) => setInterval(callback, delay),
	clearInterval: (intervalId) => clearInterval(intervalId)
};
/**
* Allows customization of how timeouts are created.
*
* @tanstack/query-core makes liberal use of timeouts to implement `staleTime`
* and `gcTime`. The default TimeoutManager provider uses the platform's global
* `setTimeout` implementation, which is known to have scalability issues with
* thousands of timeouts on the event loop.
*
* If you hit this limitation, consider providing a custom TimeoutProvider that
* coalesces timeouts.
*/
var TimeoutManager = class {
	#provider = defaultTimeoutProvider;
	#providerCalled = false;
	setTimeoutProvider(provider) {
		this.#provider = provider;
	}
	setTimeout(callback, delay) {
		return this.#provider.setTimeout(callback, delay);
	}
	clearTimeout(timeoutId) {
		this.#provider.clearTimeout(timeoutId);
	}
	setInterval(callback, delay) {
		return this.#provider.setInterval(callback, delay);
	}
	clearInterval(intervalId) {
		this.#provider.clearInterval(intervalId);
	}
};
var timeoutManager = new TimeoutManager();
/**
* In many cases code wants to delay to the next event loop tick; this is not
* mediated by {@link timeoutManager}.
*
* This function is provided to make auditing the `tanstack/query-core` for
* incorrect use of system `setTimeout` easier.
*/
function systemSetTimeoutZero(callback) {
	setTimeout(callback, 0);
}
//#endregion
//#region node_modules/@tanstack/query-async-storage-persister/build/modern/utils.js
function noop() {}
//#endregion
//#region node_modules/@tanstack/query-async-storage-persister/build/modern/asyncThrottle.js
function asyncThrottle(func, { interval = 1e3, onError = noop } = {}) {
	if (typeof func !== "function") throw new Error("argument is not function.");
	let nextExecutionTime = 0;
	let lastArgs = null;
	let isExecuting = false;
	let isScheduled = false;
	return async (...args) => {
		lastArgs = args;
		if (isScheduled) return;
		isScheduled = true;
		while (isExecuting) await new Promise((done) => timeoutManager.setTimeout(done, interval));
		while (Date.now() < nextExecutionTime) await new Promise((done) => timeoutManager.setTimeout(done, nextExecutionTime - Date.now()));
		isScheduled = false;
		isExecuting = true;
		try {
			await func(...lastArgs);
		} catch (error) {
			try {
				onError(error);
			} catch {}
		}
		nextExecutionTime = Date.now() + interval;
		isExecuting = false;
	};
}
//#endregion
//#region node_modules/@tanstack/query-async-storage-persister/build/modern/index.js
var createAsyncStoragePersister = ({ storage, key = `REACT_QUERY_OFFLINE_CACHE`, throttleTime = 1e3, serialize = JSON.stringify, deserialize = JSON.parse, retry }) => {
	if (storage) {
		const trySave = async (persistedClient) => {
			try {
				const serialized = await serialize(persistedClient);
				await storage.setItem(key, serialized);
				return;
			} catch (error) {
				return error;
			}
		};
		return {
			persistClient: asyncThrottle(async (persistedClient) => {
				let client = persistedClient;
				let error = await trySave(client);
				let errorCount = 0;
				while (error && client) {
					errorCount++;
					client = await retry?.({
						persistedClient: client,
						error,
						errorCount
					});
					if (client) error = await trySave(client);
				}
			}, { interval: throttleTime }),
			restoreClient: async () => {
				const cacheString = await storage.getItem(key);
				if (!cacheString) return;
				return await deserialize(cacheString);
			},
			removeClient: () => storage.removeItem(key)
		};
	}
	return {
		persistClient: noop,
		restoreClient: () => Promise.resolve(void 0),
		removeClient: noop
	};
};
//#endregion
export { systemSetTimeoutZero as n, timeoutManager as r, createAsyncStoragePersister as t };
