import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

export class Fright9eActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["fright8e", "sheet", "actor", "character9e"],
      template: "systems/fright9e/game-sheets/actor/actor-character-sheet.html",
      width: 870,
      height: 1250,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skillset" }]
    });
  }
  /** @override */
  get template() {
    return `systems/fright9e/game-sheets/actor/actor-${this.actor.type}-sheet.html`;
  }

  /** @override */
  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type === 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type === 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.FRIGHT9E.abilities[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const item = [];
    const gear = [];
    const weapon = [];
    const salvage = [];
    const meter = [];
    const skill = [];
    const drawback = [];
    const specialization = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      //Append to items
      if (i.type === 'item') {
        items.push(i);
      }
      // Append to gear.
      if (i.type === 'gear') {
        gear.push(i);
      }
      // Append to weapons.
      else if (i.type === 'weapon') {
        weapon.push(i);
      }
      // Append to salvage.
      else if (i.type === 'salvage') {
        salvage.push(i);
      }
      // Append to meter.
      else if (i.type === 'meter') {
        meter.push(i);
      }
      // Append to skill.
      else if (i.type === 'skill') {
        skill.push(i);
      }
      // Append to drawback.
      else if (i.type === 'drawback') {
        drawback.push(i);
      }
      // Append to specialization.
      else if (i.type === 'specialization') {
        specialization.push(i);
      }
    }

    // Assign and return
    context.item = item;
    context.gear = gear;
    context.weapon = weapon;
    context.salvage = salvage;
    context.meter = meter;
    context.skill = skill;
    context.drawback = drawback;
    context.specialization = specialization;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    console.log("activate listeners called");

    // Add event listener to font-awesome dice icons
    html.find('.fas.fa-dice-d20').on('click', (event) => this._onRoll(event));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const itemId = li.data('item-id');
      const item = this.actor.items.get(itemId);
      if (item) {
        item.sheet.render(true);
      }
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));


    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const itemId = li.data('item-id');
      const item = this.actor.items.get(itemId);
      if (item) {
        item.delete();
        li.slideUp(200, () => this.render(false));
      }
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click((event) => this._onRoll(event));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    const item = await Item.create(itemData, { parent: this.actor });
    if (item) {
      return item;
    }
  }

  /**
   * Handle rolling of dice via Font Awesome icons
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
  
    // Handle item rolls.
    if (dataset.rollType && dataset.rollType === 'item') {
      const itemId = element.closest('.item').dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) {
        return item.roll();
      }
    }
  
    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      const label = dataset.label ? `[ability] ${dataset.label}` : '';
      const roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
      return;
    }
    
    // Handle ability scores.
    if (dataset.ability) {
      const abilityKey = dataset.ability;
      const ability = this.actor.data.system.abilities[abilityKey];
      const skillModifier = parseFloat($(element).siblings('.skill-modifier-input').val()) || 0;
      const drawbackModifier = parseFloat($(element).siblings('.drawback-modifier-input').val()) || 0;
      const diceValue = ability.value;
  
      // Calculate the total modifier considering skill and drawback
      const totalModifier = skillModifier - drawbackModifier;
  
      // Construct the roll formula with the total modifier
      const rollFormula = `${diceValue}${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
  
      const roll = new Roll(rollFormula, this.actor.getRollData());
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor })
      });
      return;
    }
  }
  
  
}