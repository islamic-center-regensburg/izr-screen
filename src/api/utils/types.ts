export interface MutationCallbackOptions {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}
