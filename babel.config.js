"use strict";

module.exports = api => {
  const isTest = api.env("test");

  api.cache(() => JSON.stringify({ isTest }));

  const plugins = ["@babel/plugin-proposal-class-properties"];
  const presets = ["@babel/preset-typescript"];

  if (isTest) {
    presets.unshift(["@babel/preset-env", { targets: { node: "current" } }]);
  } else {
    presets.unshift(["@babel/preset-env", { targets: "> 0.25%, not dead" }]);
  }

  return { plugins, presets };
};
