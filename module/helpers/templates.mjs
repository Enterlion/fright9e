
export const preloadHandlebarsTemplates = async function() {
  console.log("Preloading Handlebars templates...");

  Handlebars.templates ={};

  const templatePaths = [
    // Add the paths to your template files here
    'systems/fright9e/game-sheets/partials/abilities.hbs',
    'systems/fright9e/game-sheets/partials/attributes.hbs',
    'systems/fright9e/game-sheets/partials/condition-list.hbs',
    'systems/fright9e/game-sheets/partials/drawback-list.hbs',
    'systems/fright9e/game-sheets/partials/skill-list.hbs',
    'systems/fright9e/game-sheets/partials/specialization-list.hbs'
  ];

  const templatePromises = templatePaths.map((path) => {
    return fetch(path)
      .then((response) => response.text())
      .then((templateContent) => {
        const template = Handlebars.compile(templateContent);
        const templateName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
        Handlebars.templates[templateName] = template;
        console.log(`Template loaded and compiled: ${templateName}`);
      });
  });

  await Promise.all(templatePromises);

  console.log("Handlebars templates preloaded successfully.");
};
