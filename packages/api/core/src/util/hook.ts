import {
  ForgeMutatingHookFn,
  ForgeMutatingHookSignatures,
  ForgeSimpleHookFn,
  ForgeSimpleHookSignatures,
  ResolvedForgeConfig,
} from '@electron-forge/shared-types';
import debug from 'debug';

const d = debug('electron-forge:hook');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const runHook = async <Hook extends keyof ForgeSimpleHookSignatures>(
  forgeConfig: ResolvedForgeConfig,
  hookName: Hook,
  ...hookArgs: ForgeSimpleHookSignatures[Hook]
): Promise<void> => {
  const { hooks } = forgeConfig;
  if (hooks) {
    d(`hook triggered: ${hookName}`);
    if (typeof hooks[hookName] === 'function') {
      d('calling hook:', hookName, 'with args:', hookArgs);
      await (hooks[hookName] as ForgeSimpleHookFn<Hook>)(forgeConfig, ...hookArgs);
    }
  }
  await forgeConfig.pluginInterface.triggerHook(hookName, hookArgs);
};

export async function runMutatingHook<Hook extends keyof ForgeMutatingHookSignatures>(
  forgeConfig: ResolvedForgeConfig,
  hookName: Hook,
  ...item: ForgeMutatingHookSignatures[Hook]
): Promise<ForgeMutatingHookSignatures[Hook][0]> {
  const { hooks } = forgeConfig;
  if (hooks) {
    d(`hook triggered: ${hookName}`);
    if (typeof hooks[hookName] === 'function') {
      d('calling mutating hook:', hookName, 'with item:', item[0]);
      const hook = hooks[hookName] as ForgeMutatingHookFn<Hook>;
      const result = await hook(forgeConfig, ...item);
      if (typeof result !== 'undefined') {
        item[0] = result;
      }
    }
  }
  return forgeConfig.pluginInterface.triggerMutatingHook(hookName, item[0]);
}
