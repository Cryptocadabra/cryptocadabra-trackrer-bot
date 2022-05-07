const {
  Telegraf,
  Markup,
  session,
  Scenes: { WizardScene, Stage },
} = require("telegraf");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB);
const bot = new Telegraf(process.env.BOT_TOKEN);

// KeyboardMarkup
const authorizedUser = Markup.keyboard([
  ["⚙️ Account details ⚙️"],
  ["➕ Add account ➕"],
  ["📊 Statement 📊"],
  ["💸 Request payment 💸"],
  ["👨‍💻 Support 👨‍💻"],
]).resize();

const unAuthorizedUser = Markup.keyboard([
  ["🔐 Sign up 🔐"],
  ["📝 How to connect to cashback 📝"],
  ["👨‍💻 Support 👨‍💻"],
]).resize();

const nextStep = Markup.keyboard([["Next step"]]).resize();

const brokerListKeyboard = Markup.keyboard([["Binance"], ["Bybit"]]).resize();

const brokerWasChosen = `
<u><b>Step 2: ID authentication</b></u>

<i>Please enter your <b>binanceIdList</b> ID for your account that you registered using our partner link.</i>

<a href="https://www.binanceIdList.com/en/support/faq/e23f61cafb5a4307bfb32506bd39f89d">Where can I find my binanceIdList ID</a>
`;

const idNotEntered = `
You didnt enter your id
Please, enter ID
`;

const userAddressRequest = `
<u><b>Step 3: Payment details</b></u>

<i>We make cashback payments with help of <b>TronLink Wallet</b>. Please enter the address of your <b>TronLink wallet</b>.</i>

<i>We will automatically transfer money to it twice a week.</i>

<a href="www.google.com">Why TronLink?</a>
<a href="www.google.com">Registration on TronLink Wallet</a>
`;

const userEmailRequest = `
<u><b>Last step: Contact details</b></u>

<i>Please, send us your email or telegram username that we can contact you.</i>
`;

bot.use(session());

// Start
bot.start(async (ctx) => {
  // ctx.session ??= {
  //   isAuthorized: false,

  //   userFirstName: ctx.chat.first_name || "User",
  //   userLastName: ctx.chat.last_name || "LastName",
  //   telegramChatID: ctx.chat.id,
  //   telegramUserName: ctx.chat.username,
  //   registrationDate: Date.now(),

  //   currentBroker: null,

  //   isBinance: false,
  //   isBybit: false,
  //   binanceIdList: [],
  //   bybitIdList: [],

  //   TRC20: null,
  //   contacts: [],
  // };

  // ctx.session.isAuthorized ??= false;
  // ctx.session.userFirstName ??= ctx.chat.first_name;
  // ctx.session.userLastName ??= ctx.chat.last_name;
  // ctx.session.telegramChatID ??= ctx.chat.id;
  // ctx.session.telegramUserName ??= ctx.chat.usernamel;

  // ctx.session.currentBroker ??= null;

  // ctx.session.isBinance ??= false;
  // ctx.session.isBybit ??= false;
  // ctx.session.binanceIdList ??= [];
  // ctx.session.bybitIdList ??= [];

  // ctx.session.TRC20 = null;
  // ctx.session.contacts = [];

  await client.connect();
  const userListDB = await client.db().collection("userData");
  const userToFind =
    (await userListDB.findOne({
      telegramChatID: ctx.chat.id,
    })) || false;

  if (userToFind.isAuthorized) {
    ctx.session.isAuthorized ??= false;
    ctx.session.userFirstName ??= ctx.chat.first_name;
    ctx.session.userLastName ??= ctx.chat.last_name;
    ctx.session.telegramChatID ??= ctx.chat.id;
    ctx.session.telegramUserName ??= ctx.chat.usernamel;

    ctx.session.currentBroker ??= null;

    ctx.session.isBinance ??= false;
    ctx.session.isBybit ??= false;
    ctx.session.firstBinanceAccount ??= null;
    ctx.session.firstBybitAccount ??= null;

    ctx.session.TRC20 = null;
    ctx.session.email = null;

    ctx.replyWithHTML(
      `👋 Welcome, dear ${ctx.from.first_name}!`,
      authorizedUser
    );
  } else {
    ctx.replyWithHTML(
      `👋 Welcome, dear ${ctx.from.first_name}!`,
      unAuthorizedUser
    );

    // userListDB.insertOne({
    //   isAuthorized: ctx.session.isAuthorized,

    //   userFirstName: ctx.chat.first_name || "User",
    //   userLastName: ctx.chat.last_name || "LastName",
    //   telegramChatID: ctx.chat.id,
    //   telegramUserName: ctx.chat.username,
    //   registrationDate: Date.now(),

    //   isBinance: false,
    //   isBybit: false,
    //   binanceIdList: [],
    //   bybitIdList: [],
    //   TRC20: null,
    //   contacts: [],
    // });
  }

  console.log(ctx.session.currentBroker, ctx.session.isBinance);

  // await ctx.reply(`${userToFind.isAuthorized}`);
  // await ctx.reply(`${ctx.session.telegramChatID}`);
});

// Scene
const brokerHandler = Telegraf.on("text", async (ctx) => {
  const userMessage = ctx.message.text;
  ctx.session.currentBroker = userMessage;

  // if (userMessage === "Binance") {
  //   ctx.session.isBinance = true;
  // } else if (userMessage === "Bybit") {
  //   ctx.session.isBybit = true;
  // }

  await ctx.replyWithHTML(
    `
<u><b>Step 2: ID authentication</b></u>
  
<i>Please enter your <b>${userMessage}</b> ID for your account that you registered using our partner link.</i>
  
<a href="https://www.binanceIdList.com/en/support/faq/e23f61cafb5a4307bfb32506bd39f89d">Where can I find my binanceIdList ID</a>
  ${ctx.session.currentBroker} `,
    {
      disable_web_page_preview: true,
      ...Markup.keyboard([["Next step"]]).resize(),
      // reply_markup: { remove_keyboard: true },
    }
  );

  return ctx.wizard.next();
});

// const userIdHandler = Telegraf.hears(/^[0-9]+$/, async (ctx) => {
//   const userMessage = ctx.message.text;

//   if (ctx.session.currentBroker === "Binance") {
//     ctx.session.binanceIdList.push(userMessage);
//   } else if (ctx.session.currentBroker === "Bybit") {
//     ctx.session.bybitIdList.push(userMessage);
//   } else {
//     await ctx.replyWithHTML(idNotEntered);
//   }

//   await ctx.replyWithHTML(
//     `🥳 Great! ID <code>${userMessage}</code> was added.`
//   );

//   await ctx.replyWithHTML(userAddressRequest, {
//     disable_web_page_preview: true,
//   });

//   return ctx.wizard.next();
// });

const userIdHandler = Telegraf.on("text", async (ctx) => {
  const userMessage = ctx.message.text;

  if (userMessage === "Next step") {
    await ctx.replyWithHTML(`Okay, yout can fill this data later...`);
  } else {
    if (ctx.session.currentBroker === "Binance") {
      ctx.session.firstBinanceAccount = userMessage;
    } else if (ctx.session.currentBroker === "Bybit") {
      ctx.session.firstBybitAccount = userMessage;
    } else {
      await ctx.replyWithHTML(idNotEntered);
    }

    await ctx.replyWithHTML(
      `🥳 Great! ID <code>${userMessage}</code> was added.`
    );
  }

  await ctx.replyWithHTML(userAddressRequest, {
    disable_web_page_preview: true,
  });

  return ctx.wizard.next();
});

const userWalletHandler = Telegraf.on("text", async (ctx) => {
  const userMessage = ctx.message.text;

  if (userMessage === "Next step") {
    await ctx.replyWithHTML(`Okay, yout can fill this data later...`);
  } else {
    ctx.session.TRC20 = userMessage;

    await ctx.replyWithHTML(
      `
    👍 Done! Address <code>${ctx.session.TRC20}</code> was added.

<i>We want to remind you that you can change it at any time in your account settings.</i>
    `
    );
  }

  await ctx.replyWithHTML(userEmailRequest);

  return ctx.wizard.next();
});

const userEmailHandler = Telegraf.on("text", async (ctx) => {
  const userMessage = ctx.message.text;

  if (userMessage === "Next step") {
    await ctx.replyWithHTML(
      `Okay, you can fill this data later`,
      authorizedUser
    );
  } else {
    ctx.session.contacts = userMessage;

    await ctx.replyWithHTML(
      `👍 Great! Now we can contact you <code>${ctx.session.email} </code>`,
      authorizedUser
    );
  }

  await client.connect();
  const userListDB = await client.db().collection("userData");

  userListDB.insertOne({
    isAuthorized: true,

    userFirstName: ctx.chat.first_name || "User",
    userLastName: ctx.chat.last_name || "LastName",
    telegramChatID: ctx.chat.id,
    telegramUserName: ctx.chat.username,
    registrationDate: Date.now(),

    isBinance: ctx.session.isBinance,
    isBybit: ctx.session.isBybit,
    firstBinanceAccount: ctx.session.firstBinanceAccount,
    firstBybitAccount: ctx.session.firstBybitAccount,
    TRC20: ctx.session.TRC20,
    contacts: ctx.session.email,
  });

  return ctx.scene.leave();
});

// WizardScenes
const signingUpScene = new WizardScene(
  "signingUpScene",
  brokerHandler,
  userIdHandler,
  userWalletHandler,
  userEmailHandler
);

signingUpScene.enter((ctx) =>
  ctx.replyWithHTML(
    `
<u><b>Step 1: Choosing the broker</b></u>

<i>Please choose a broker from the list below (at the moment we only work with <b>binanceIdList</b>).</i>
`,
    brokerListKeyboard
  )
);

const stage = new Stage([signingUpScene]);

// Change TRC20 ADDRESS - DELETE
const tronLinkWalletChangeHandler = Telegraf.on("text", async (ctx) => {
  const userMessage = ctx.message.text;

  await client.connect();
  const userListDB = await client.db().collection("userData");
  const userToFind =
    (await userListDB.findOne({
      telegramChatID: ctx.chat.id,
    })) || false;

  await userListDB.updateOne(
    { telegramChatID: ctx.chat.id },
    {
      $set: {
        TRC20: userMessage,
      },
    }
  );

  ctx.replyWithHTML(
    `Your TrokLink Wallet Address was successfully changed on ${userMessage}`
  );

  return ctx.scene.leave();
});

const tronLinkWalletChangeScene = new WizardScene(
  "tronLinkWalletChangeScene",
  tronLinkWalletChangeHandler
);

tronLinkWalletChangeScene.enter((ctx) =>
  ctx.replyWithHTML(
    `
Please, enter new TRC20 adress`
  )
);

const stage1 = new Stage([tronLinkWalletChangeScene]);

// CHANGE STATE SCENES : DELETE - РЕШИТЬ ПРОБЛЕМУ НЕСКОЛЬКИХ АККАУНТОВ У ОДНОГО ПОЛЬЗОВАТЕЛЯ
// const binanceIDChangeScene = new WizardScene(
//   "binanceIDChangeScene",
//   newBinanceIdRequestHandler
// );

// binanceIDChangeScene.enter(async (ctx) => {
//   await client.connect();
//   const userListDB = await client.db().collection("userData");
//   const userToFind =
//     (await userListDB.findOne({
//       telegramChatID: ctx.chat.id,
//     })) || false;

//   if (!userToFind.secondBinanceAccount) {
//     ctx.replyWithHTML(
//       `Please, enter new BinanceID

// Where can I find Binance ID`,
//       {
//         disable_web_page_preview: true,
//         ...Markup.keyboard([[`${userToFind.firstBinanceAccount}`]]).resize(),
//       }
//     );
//   }

//   return ctx.scene.leave();
// });

// const newBinanceIdRequestHandler = Telegraf.on("text", async (ctx) => {
//   const userMessage = ctx.from.message;

//   await client.connect();
//   const userListDB = await client.db().collection("userData");
//   const userToFind =
//     (await userListDB.findOne({
//       telegramChatID: ctx.chat.id,
//     })) || false;

//   ctx.replyWithHTML(``);
// });

bot.use(stage.middleware());
bot.use(stage1.middleware());

bot.hears("🔐 Sign up 🔐", (ctx) => {
  ctx.scene.enter("signingUpScene");
});

bot.hears("⚙️ Account details ⚙️", async (ctx) => {
  await client.connect();
  const userListDB = await client.db().collection("userData");
  const userToFind =
    (await userListDB.findOne({
      telegramChatID: ctx.chat.id,
    })) || false;

  if (userToFind) {
    ctx.replyWithHTML(
      `
Binance ID: ${
        userToFind.firstBinanceAccount ? userToFind.firstBinanceAccount : "-"
      }
Bybit ID: ${userToFind.firstBybitAccount ? userToFind.firstBybitAccount : "-"}
TronLink Wallet: ${userToFind.TRC20 ? userToFind.TRC20 : "-"} 
E-mail: ${userToFind.contacts ? userToFind.contacts : "-"}    
    `,
      Markup.inlineKeyboard([
        [Markup.button.callback("Change Binance ID", "changeBinance")],
        [Markup.button.callback("Change Bybit ID", "changeBybit")],
        [Markup.button.callback("Change TRC20 address", "changeWallet")],
        [Markup.button.callback("Change E-mail", "changeEmail")],
      ])
    );
  } else {
    ctx.reply("Please, signUp");
  }
});

// Buttons handlers
bot.action("changeWallet", async (ctx) => {
  ctx.scene.enter("tronLinkWalletChangeScene");
});

stage.hears("exit", (ctx) => ctx.scene.leave());

bot.launch();
