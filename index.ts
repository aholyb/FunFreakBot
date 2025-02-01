import { Bot } from "grammy";
import { config } from "dotenv";
import moment from "moment";
import OpenAI from "openai";

config();

const messages: { text: string | undefined; date: any; user: string }[] = [];

const bot = new Bot(process.env.TELEGRAM_BOT_KEY as string);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


  async function getSummary(text: string) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "developer", content: "You are a helpful assistant." },
            { "role": "user", "content": `Напиши краткий пересказ следующего текста: "${text}"` }
        ]
    });
    return completion.choices[0].message.content;
}

bot.hears('Фрик, что умеешь?', async (ctx) => { 
    ctx.reply(`<b>Список моих возможностей:</b>

1. Ставить клоунов на сообщение Нади;
2. Отображение общей статистики
3. Отображение индивидуальной статистики
4. Собирать информацию из чата за последние 12 часов и отправлять в чат`, {
        parse_mode: 'HTML',
    })
})

// Общая статистика
bot.hears(/Фри(к|чек|шер|дрих|чи[кк]?)\s*,?\s*ста(тистика|та|туля|т[а-я]*)/i, async (ctx) => {

    ctx.reply(`Вот общая статистика чатика, <b>${ctx.from?.first_name || ctx.from?.username || 'дорогуша'}:</b>

<b>[Top Пользователей]</b>

Количество сообщений в чате: <b>Тут количество</b>`, {
        parse_mode: 'HTML' 
    })

})

bot.hears(/Фри(к|чек|шер|дрих|чи[кк]?)\s*,?\s*моя\s*ста(тистика|та|туля|т[а-я]*)/i, async (ctx) => {
    const userId = ctx.from?.id;

    if (userId) {
        ctx.reply(`Вот твоя статистика, <b>${ctx.from?.first_name || ctx.from?.username || 'дорогуша'}:</b>`, {
            parse_mode: 'HTML',
        });
    } else {
        ctx.reply('По тебе нет статистики :(')
    }
})

bot.command('summary', async (ctx) => {
    const twelveHoursAgo = moment().subtract(12, 'hours');
    const recentMessages = messages.filter(msg => moment(msg.date).isAfter(twelveHoursAgo));

    if (recentMessages.length > 0) {
        try {
            const summary = await getSummary(recentMessages.map((message) => `${message.user}: ${message.text}`).join(', '));
            ctx.reply(`Вот краткий пересказ:\n${summary}`, {
                parse_mode: 'HTML',
            });
        } catch(error) {
            console.error('Ошибка при запросе к OpenAI:', error);
            ctx.reply('Произошла ошибка при получении пересказа. Попробуйте снова.');
        }
    };
})

// Клоун на сообщения
bot.on('message', (ctx) => {
    const userId = ctx.from.id;
    const messageTime = moment(ctx.message?.date * 1000);

    messages.push({
        text: ctx.message?.text,
        date: messageTime,
        user: ctx.from.username || ctx.from.first_name ,
    });

    if (userId === 382451968) {
        ctx.react('🤡');
    }
})

bot.start();