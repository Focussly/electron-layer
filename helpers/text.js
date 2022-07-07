'use strict';

function getCamelCaseToDashCase(string = '') {
  return string.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/(^\-|\-$)/g, '');
}

module.exports = {
  getCamelCaseToDashCase,
};
