"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const dotenv_1 = require("dotenv");
const moment_1 = __importDefault(require("moment"));
const openai_1 = __importDefault(require("openai"));
(0, dotenv_1.config)();
const messages = [];
const bot = new grammy_1.Bot(process.env.TELEGRAM_BOT_KEY);
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function getSummary(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "developer", content: "You are a helpful assistant." },
                { "role": "user", "content": `Напиши краткий пересказ следующего текста: "${text}"` }
            ]
        });
        return completion.choices[0].message.content;
    });
}
bot.hears('Фрик, что умеешь?', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.reply(`<b>Список моих возможностей:</b>

1. Ставить клоунов на сообщение Нади;
2. Отображение общей статистики
3. Отображение индивидуальной статистики
4. Собирать информацию из чата за последние 12 часов и отправлять в чат`, {
        parse_mode: 'HTML',
    });
}));
// Общая статистика
bot.hears(/Фри(к|чек|шер|дрих|чи[кк]?)\s*,?\s*ста(тистика|та|туля|т[а-я]*)/i, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    ctx.reply(`Вот общая статистика чатика, <b>${((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name) || ((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username) || 'дорогуша'}:</b>

<b>[Top Пользователей]</b>

Количество сообщений в чате: <b>Тут количество</b>`, {
        parse_mode: 'HTML'
    });
}));
bot.hears(/Фри(к|чек|шер|дрих|чи[кк]?)\s*,?\s*моя\s*ста(тистика|та|туля|т[а-я]*)/i, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (userId) {
        ctx.reply(`Вот твоя статистика, <b>${((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.first_name) || ((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username) || 'дорогуша'}:</b>`, {
            parse_mode: 'HTML',
        });
    }
    else {
        ctx.reply('По тебе нет статистики :(');
    }
}));
bot.command('summary', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const twelveHoursAgo = (0, moment_1.default)().subtract(12, 'hours');
    const recentMessages = messages.filter(msg => (0, moment_1.default)(msg.date).isAfter(twelveHoursAgo));
    if (recentMessages.length > 0) {
        try {
            const summary = yield getSummary(recentMessages.map((message) => `${message.user}: ${message.text}`).join(', '));
            ctx.reply(`Вот краткий пересказ:\n${summary}`, {
                parse_mode: 'HTML',
            });
        }
        catch (error) {
            console.error('Ошибка при запросе к OpenAI:', error);
            ctx.reply('Произошла ошибка при получении пересказа. Попробуйте снова.');
        }
    }
    ;
}));
// Клоун на сообщения
bot.on('message', (ctx) => {
    var _a, _b;
    const userId = ctx.from.id;
    const messageTime = (0, moment_1.default)(((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.date) * 1000);
    messages.push({
        text: (_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text,
        date: messageTime,
        user: ctx.from.username || ctx.from.first_name,
    });
    if (userId === 382451968) {
        ctx.react('🤡');
    }
});
bot.start();
