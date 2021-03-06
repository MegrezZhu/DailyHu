const config = require('./config');
const axios = require('axios');
const assert = require('assert');
const cheerio = require('cheerio');
const _ = require('lodash');

const processHtml = (siteConfig, html) => {
  const $ = cheerio.load(html);
  const res = [];

  $(siteConfig.listItemSelector).each((index, listItem) => {
    res.push(siteConfig.processListItem(listItem));
  });
  return _.compact(res);
};

const processJson = (siteConfig, data) => {
  const list = siteConfig.processList(data);
  return _.chain(list).map(siteConfig.processListItem).compact().value();
};

const getList = async function (site, pageNum) {
  const siteConfig = config[site];

  assert(siteConfig, 'no such site registered.');
  assert(pageNum <= siteConfig.maximumPage, 'page number exceeded.');
  // 根据对应页的url，获得该页目录数据
  const data = (await axios.get(siteConfig.listUrl(pageNum))).data;

  // 对于json和html两种类型数据分别处理
  switch (siteConfig.listType) {
    case 'html':
      return processHtml(siteConfig, data);
    case 'json':
      return processJson(siteConfig, data);
  }
};

module.exports = getList;
