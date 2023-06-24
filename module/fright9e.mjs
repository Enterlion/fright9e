// Import Item and Actor Class
import { Fright9eActor } from "./documents/Fright9eActor.mjs";
import { Fright9eItem } from "./documents/Fright9eItem.mjs"

// Import Item and Actor Sheets that replace Default Sheets
import Fright9eItemSheet from "./sheets/Fright9eItemSheet.mjs";
import { Fright9eActorSheet } from "./sheets/Fright9eActorSheet.mjs"

import { FRIGHT9E } from "./helpers/config.js";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";

await preloadHandlebarsTemplates();

// Assign the templates to the fright9e.templates object
FRIGHT9E.templates = {
  abilities: Handlebars.templates['abilities'],
  attributes: Handlebars.templates['attributes'],
  conditionList: Handlebars.templates['condition-list'],
  drawbackList: Handlebars.templates['drawback-list'],
  skillList: Handlebars.templates['skill-list'],
  specializationList: Handlebars.templates['specialization-list']
};

Hooks.once('init', async function() {
  console.log("fright9e | Initializing Frightful v9");

  game.fright9e = {
    Fright9eActor,
    Fright9eItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.FRIGHT9E = FRIGHT9E;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  // Define custom Document Classes
  CONFIG.Actor.documentClass = Fright9eActor;
  CONFIG.Item.documentClass = Fright9eItem;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet('fright9e', Fright9eItemSheet, { makeDefault: true });
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet('fright9e', Fright9eActorSheet, { makeDefault: true });
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('ifEqual', function(arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});


Handlebars.registerHelper('selectOptions', function(options, selectedValue) {
  let html = '';
  for (let key in options) {
    if (options.hasOwnProperty(key)) {
      const value = options[key];
      const selected = (value === selectedValue) ? 'selected' : '';
      html += `<option value="${value}" ${selected}>${key}</option>`;
    }
  }
  return html;
});

Handlebars.registerPartial('specialization-list', '{{#each specializationTypes}}<option value="{{@key}}">{{this}}</option>{{/each}}');
  
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
  
Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});
  
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
  
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.fright9e.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "fright9e.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}
