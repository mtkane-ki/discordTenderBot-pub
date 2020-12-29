const dotenv = require("dotenv").config();
const Discord = require("discord.js");
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const pubStore = require("./pubStore");
const fs = require("fs");
const userActions = require("./userStoreActions");
const prefix = "!";
const he = require("he");

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;
  const commandBody = msg.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();
  //console.log(commandBody)
  //console.log(command)

  switch (command) {
    case "pubsubme": {
      //console.info(Object.entries(msg))
      //console.info(msg.author)
      //console.log(messageStr)
      const users = await userActions.reloadUserStore();
      const user = await userActions.getUser(users, msg.author.id);
      if (user === undefined) {
        msg.reply(
          "I'm sorry, I don't know what your preferred store number is. Please submit it with !pubstoresave"
        );
        break;
      }

      const queryRes = await pubStore.queryStore(user.storeNumber);
      //console.log(queryRes);
      if (queryRes) {
        msg.reply({
          embed: {
            color: 3447003,
            title: "Today's sale sub!",
            fields: [
              { name: "Sale Sub:", value: he.decode(String(queryRes.title)) },
              {
                name: "Sub Details:",
                value: he.decode(String(queryRes.description)),
              },
              { name: "Price:", value: he.decode(String(queryRes.finalPrice)) },
            ],
            image: {
              url: String(queryRes.imageUrl),
            },
          },
        });
      } else {
        msg.reply(
          `Store number ${user.storeNumber} invalid or no sub is on sale`
        );
      }
      break;
    }

    case "pubstorelookup": {
      if (args.length === 0 || isNaN(ParseInt(args[0]))) {
        msg.reply(
          "Please provide a zip code as an argument with !pubstorelookup"
        );
        break;
      }
      const storeRes = await pubStore.getStores(args);
      if (storeRes.length === 0) {
        msg.reply(
          "The requested zipcode is invalid. Please try another zipcode"
        );
        break;
      }
      msg.reply(
        `These are the 5 stores nearest your zipcode. Please select a store number, and say "!pubstoresave xxxx", xxxx being your preferred store number`
      );
      msg.reply(JSON.stringify(storeRes, null, 2), { code: "JSON" });
      break;
    }

    case "pubstoresave": {
      const users = await userActions.reloadUserStore();
      const user = await userActions.getUser(users, msg.author.id);

      const storeQuery = pubStore.queryStore(args[0]);
      if (!storeQuery) {
        msg.reply(
          `The store number ${args} is invalid. Please try valid store number`
        );
        break;
      }
      if (args.length === 0 || isNaN(parseInt(args[0]))) {
        msg.reply("Please provide a store number along with this command.");
        break;
      }
      if (user) {
        const writeType = userActions.writeUserStore(msg.author, args[0]);
        msg.reply(
          `Your store number preference of ${args} has been ${writeType}!`
        );
        break;
      }
      break;
    }

    case "pubsubhelp":
      msg.channel.send({
        embed: {
          color: 3447003,
          title: `The PubSubBot has 4 commands, *!pubsubme*, *!pubstorelookup*, *!pubstoresave*, and *!pubstorehelp*`,
          fields: [
            {
              name: "!pubstorelookup",
              value: `This command is run to look up nearby publix stores. You provide it with a zipcode. \n
              \`!pubstorelookup 33463\``,
            },
            {
              name: "!pubstoresave",
              value: `This command is used to save your store preference. You provide it with a store number. \n
              \`!pubstoresave 1144\` \n`,
            },
            {
              name: "!pubsubme",
              value: `This command will return to you the current sub deal at your saved publix. It will return an error if you do not have a store number saved. \n
              \`!pubsubme\` \n`,
            },
            {
              name: "!pubsubhelp",
              value: `This command displays this help file \n
              \`!pubsubhelp\` `,
            },
          ],
        },
      });

      break;
  }
});
