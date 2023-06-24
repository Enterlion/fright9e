import { FRIGHT9E } from "../helpers/config.js";

export default class Fright9eItemSheet extends ItemSheet {

    /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["fright9e", "sheet", "item", "item9e"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]


    });
  }

  /** @override */
  get template() {
    return `systems/fright9e/game-sheets/item/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

   /** @override */
    getData() {
        // Retrieve base data structure.
        const context = super.getData();
   
    // Add the system-specific configuration
    context.config = CONFIG.FRIGHT9E;

    // Render the specialization-list template with specializationTypes from config.js
    const specializationListHtml = Handlebars.templates['specialization-list']({
      specializationTypes: FRIGHT9E.specializationTypes,
      selectedSpecializationType: 'agriculture' // Replace with your desired selected value
    });
    context.specializationListHtml = specializationListHtml;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    const actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    const itemData = context.item;
    context.system = itemData.system;
    context.flags = itemData.flags;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Handle specialization selection click
    html.find('fieldset[name="specialization-selector"]').on('click', 'a', this._onSpecializationSelect.bind(this));
  }

  /**
   * Handle specialization selection click event
   * @param {Event} clickEvent
   */
  _onSpecializationSelect(clickEvent) {
    clickEvent.preventDefault();
    const selectedValue = $(clickEvent.currentTarget).data('value');
    // Perform the desired action with the selected specialization value
    console.log('Selected Specialization:', selectedValue);
  }

  /**
   * Show this item in the chat.
   * @param {Event} event
   */
  _onItemRoll(event) {
    event.preventDefault();
    this.item.roll();
  }
}