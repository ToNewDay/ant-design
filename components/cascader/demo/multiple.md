---
order: 13
title:
  zh-CN: 多选
  en-US: multiple
---

## zh-CN

省市区级联。支持多选，暂不支持查询。

## en-US

Cascade selection box for selecting province/city/district.

```jsx
import { Cascader } from 'antd';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
          {
            value: 'xihu2',
            label: 'West Lake2',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
          {
            value: 'zhonghuamen2',
            label: 'Zhong Hua Men2',
          },
          {
            value: 'zhonghuamen3',
            label: 'Zhong Hua Men3',
          },
        ],
      },
      {
        value: 'nanjing2',
        label: 'Nanjing2',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua Men',
          },
          {
            value: 'zhonghuamen2',
            label: 'Zhong Hua Men2',
          },
          {
            value: 'zhonghuamen3',
            label: 'Zhong Hua Men3',
          },
        ],
      },
    ],
  },
];

function onChange(value, options) {
  console.log(value);
  console.log(options);
}

ReactDOM.render(
    <Cascader 
        mode = 'multiple'
        options={options} 
        onChange={onChange} 
        allowClear
        placeholder="Please select" 
    />,
  mountNode,
);
```
