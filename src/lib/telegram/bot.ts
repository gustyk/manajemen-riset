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

  let processedMessage = message;
  const validButtons: InlineKeyboardButton[][] = [];

  // Telegram API menolak URL yang mengandung localhost atau IP lokal di inline_keyboard.
  // Jika dalam lingkungan development (localhost), kita pindahkan link ke dalam isi teks pesan Markdown.
  if (buttons && buttons.length > 0) {
    const localhostLinks: { text: string; url: string }[] = [];

    buttons.forEach((row) => {
      const validRow: InlineKeyboardButton[] = [];
      row.forEach((btn) => {
        if (btn.url) {
          const isLocalhost =
            btn.url.includes('localhost') ||
            btn.url.includes('127.0.0.1') ||
            btn.url.startsWith('http://0.0.0.0');

          if (isLocalhost) {
            localhostLinks.push({ text: btn.text, url: btn.url });
          } else {
            validRow.push(btn);
          }
        } else {
          validRow.push(btn);
        }
      });
      if (validRow.length > 0) {
        validButtons.push(validRow);
      }
    });

    if (localhostLinks.length > 0) {
      processedMessage += '\n\n*Tautan Akses:*';
      localhostLinks.forEach((link) => {
        processedMessage += `\n• ${link.text}: ${link.url}`;
      });
    }
  }

  const payload: Record<string, any> = {
    chat_id: chatId,
    text: processedMessage,
    parse_mode: 'Markdown',
  };

  if (validButtons.length > 0) {
    payload.reply_markup = {
      inline_keyboard: validButtons,
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
