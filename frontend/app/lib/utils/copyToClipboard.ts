import { addToast } from '@heroui/toast';
import settingsStore from '@/app/stores/settingsStore';

export async function CopyToClipboard(text: string): Promise<boolean> {
  const copied = await copy(text);
  if (copied) {
    addToast({
      color: 'success',
      severity: 'success',
      title: settingsStore.t.toasts.copySuccess,
    });
    return true;
  } else {
    addToast({
      color: 'warning',
      severity: 'warning',
      title: settingsStore.t.toasts.copyError,
    });
    return false;
  }
}

async function copy(text: string) {
  try {
    if (typeof window === 'undefined') return false;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
