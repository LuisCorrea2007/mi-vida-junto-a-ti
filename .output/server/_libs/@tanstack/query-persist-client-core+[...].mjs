import { a as dehydrate, o as hydrate } from "../tanstack__query-core.mjs";
//#region node_modules/@tanstack/query-persist-client-core/build/modern/persist.js
/**
* Checks if emitted event is about cache change and not about observers.
* Useful for persist, where we only want to trigger save when cache is changed.
*/
var cacheEventTypes = [
	"added",
	"removed",
	"updated"
];
function isCacheEventType(eventType) {
	return cacheEventTypes.includes(eventType);
}
/**
* Restores persisted data to the QueryCache
*  - data obtained from persister.restoreClient
*  - data is hydrated using hydrateOptions
* If data is expired, busted, empty, or throws, it runs persister.removeClient
*/
async function persistQueryClientRestore({ queryClient, persister, maxAge = 864e5, buster = "", hydrateOptions }) {
	try {
		const persistedClient = await persister.restoreClient();
		if (persistedClient) if (persistedClient.timestamp) {
			const expired = Date.now() - persistedClient.timestamp > maxAge;
			const busted = persistedClient.buster !== buster;
			if (expired || busted) return persister.removeClient();
			else hydrate(queryClient, persistedClient.clientState, hydrateOptions);
		} else return persister.removeClient();
	} catch (err) {
		await persister.removeClient();
		throw err;
	}
}
/**
* Persists data from the QueryCache
*  - data dehydrated using dehydrateOptions
*  - data is persisted using persister.persistClient
*/
async function persistQueryClientSave({ queryClient, persister, buster = "", dehydrateOptions }) {
	const persistClient = {
		buster,
		timestamp: Date.now(),
		clientState: dehydrate(queryClient, dehydrateOptions)
	};
	await persister.persistClient(persistClient);
}
/**
* Subscribe to QueryCache and MutationCache updates (for persisting)
* @returns an unsubscribe function (to discontinue monitoring)
*/
function persistQueryClientSubscribe(props) {
	const unsubscribeQueryCache = props.queryClient.getQueryCache().subscribe((event) => {
		if (isCacheEventType(event.type)) persistQueryClientSave(props);
	});
	const unsubscribeMutationCache = props.queryClient.getMutationCache().subscribe((event) => {
		if (isCacheEventType(event.type)) persistQueryClientSave(props);
	});
	return () => {
		unsubscribeQueryCache();
		unsubscribeMutationCache();
	};
}
/**
* Restores persisted data to QueryCache and persists further changes.
*/
function persistQueryClient(props) {
	let hasUnsubscribed = false;
	let persistQueryClientUnsubscribe;
	const unsubscribe = () => {
		hasUnsubscribed = true;
		persistQueryClientUnsubscribe?.();
	};
	return [unsubscribe, persistQueryClientRestore(props).then(() => {
		if (!hasUnsubscribed) persistQueryClientUnsubscribe = persistQueryClientSubscribe(props);
	})];
}
//#endregion
export { persistQueryClient as t };
