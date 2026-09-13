// Helper utility untuk berkomunikasi dengan Telegram Bot API

interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export async function sendTelegramMessage(
  chatId: number | string,
  message: string,
  buttons?: InlineKeyboardButton[][]
): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN belum disetel.' };
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;

  const payload: Record<string, any> = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  };

  if (buttons && buttons.length > 0) {
    payload.reply_markup = {
      inline_keyboard: buttons,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.description || 'Gagal mengirim pesan Telegram' };
    }

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error saat menghubungi Telegram API' };
  }
}
