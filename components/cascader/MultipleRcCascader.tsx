import React, { useReducer, useState, ReactNode, ReactElement, useMemo, useEffect, Dispatch, useContext } from 'react';
import classNames from 'classnames';
import { CascaderProps, CascaderOption } from 'rc-cascader/lib/Cascader';
import RcCascader from 'rc-cascader';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckBox from '../checkbox';

interface IValueInfo {
  id: string | number;
  text: any;
  indexIdStr: string;
  addition: CascaderOption;
}

interface IMultipleInputProps {
  prefixCls?: string;
  valueItems?: IValueInfo[];
  active: boolean;
  onChange?: (value: IValueInfo[]) => void;
  onClick?: () => void;
  clearIcon?: React.ReactNode;
  inputIcon?: React.ReactNode;
  placeholder?: string;
}

type CHECK_STATU = 'none' | 'all_checked' | 'part_checked';

interface MultipleCascaderOption extends CascaderOption {
  checkStatu?: CHECK_STATU;
  children?: MultipleCascaderOption[];
}

interface IOptionCheckStatuProps {
  checkStatu: CHECK_STATU;
  children?: ReactNode;
  indexIdStr: string;
}

interface IBuildOptionLabelParam {
  optionInfo: MultipleCascaderOption;
  selectedItems: IValueInfo[];
  optionIndexStrArr: string[];
}

interface IBuildOptionLabelResult {
  label: ReactNode;
  checkStatu: CHECK_STATU;
}

interface IBuildOptionsParam {
  selectedItems: IValueInfo[];
  data?: MultipleCascaderOption[];
  parentIds: string[];
}

interface IMultipleRcCascaderProps extends CascaderProps {
  placeholder?: string;
  inputIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
}


type Action =
  | { type: 'add'; payload: IValueInfo[] }
  | { type: 'remove'; payload: string[] }
  | { type: 'reset'; payload: IValueInfo[] }
  | { type: 'set_all_children'; payload: { indexIdStr: string; checkStatu: CHECK_STATU; optionValueList: IValueInfo[] } };

function reducer(state: IValueInfo[], action: Action): IValueInfo[] {
  switch (action.type) {
    case 'add': {
      const addIndexStrArr = action.payload.map(m => m.indexIdStr);
      const noRepeat = state.filter(m => addIndexStrArr.indexOf(m.indexIdStr) === -1);
      return [...noRepeat, ...action.payload];
    }
    case 'remove':
      return state.filter(m => action.payload.indexOf(m.indexIdStr) === -1);
    case 'reset':
      return [...action.payload];
    case 'set_all_children': {
      // 对子级的操作深入到最末级别
      const { indexIdStr = '', checkStatu, optionValueList } = action.payload;
      const noRepeat = state.filter(
        m =>
          m.indexIdStr.indexOf(indexIdStr) === -1 &&
          (m.addition.children === undefined || m.addition.children.length === 0),
      );
      if (checkStatu === 'none') {
        return noRepeat;
      }
      return [
        ...noRepeat,
        ...optionValueList.filter(
          m =>
            m.indexIdStr.indexOf(indexIdStr) !== -1 &&
            (m.addition.children === undefined || m.addition.children.length === 0),
        ),
      ];

    }

    default:
      throw new Error();
  }
}
const dispatchTypeIns: Dispatch<any> = () => { };

const Context = React.createContext({ dispatch: dispatchTypeIns, state: [] as IValueInfo[], optionValueList: [] as IValueInfo[] });

function MultipleInput(props: IMultipleInputProps) {
  const { prefixCls, valueItems, active = false, onChange = () => { }, placeholder, inputIcon, clearIcon } = props;
  const customerValueItems = valueItems || [];

  const handleCloseClick = (indexId: string) => {
    const currentValues = customerValueItems.filter(m => m.indexIdStr !== indexId);
    onChange(currentValues);
  };

  return (
    <div
      className={classNames(`${prefixCls}-multiple-input`, {
        [`${prefixCls}-multiple-input-active`]: active,
      })}
      onClick={props.onClick}
    >
      {customerValueItems.length === 0 && <span className={`${prefixCls}-multiple-input-placeholder`}>{placeholder}</span>}
      {customerValueItems.map(m => (
        <div key={m.indexIdStr} className={`${prefixCls}-multiple-input-item`}>
          <div className={`${prefixCls}-multiple-input-item-text`}>{m.text}</div>
          <div
            className={`${prefixCls}-multiple-input-item-icon`}
            onClick={e => {
              handleCloseClick(m.indexIdStr);
              e.stopPropagation();
            }}
          >
            <CloseOutlined />
          </div>
        </div>
      ))}
      {clearIcon}
      {inputIcon}
    </div>
  );
}

function OptionCheckStatu(props: IOptionCheckStatuProps): ReactElement {
  const { checkStatu, indexIdStr } = props;
  const { dispatch, optionValueList } = useContext(Context);
  const handleClick = () => {
    dispatch({
      type: 'set_all_children',
      payload: { checkStatu: checkStatu === 'all_checked' ? 'none' : 'all_checked', indexIdStr, optionValueList },
    });
  };

  const CHECK_STATU_ICON_DIC: Map<CHECK_STATU, ReactNode> = new Map([
    ['none', <CheckBox key='none' checked={false} />],
    ['all_checked', <CheckBox key='none' checked />],
    ['part_checked', <CheckBox key='none' indeterminate />],
  ]);
  const iconNode = CHECK_STATU_ICON_DIC.get(props.checkStatu);
  return (
    <div style={{ display: 'contents' }}>
      <span onClick={handleClick} style={{ marginRight: '12px' }} >{iconNode}</span>
      {props.children}
    </div>
  );
}

function buildOptionLabel(param: IBuildOptionLabelParam): IBuildOptionLabelResult {
  const { optionInfo, selectedItems, optionIndexStrArr = [] } = param;
  const dataIndexStr = `${optionIndexStrArr.join(',')},`;
  const defaultOptionProps: IOptionCheckStatuProps = {
    checkStatu: 'none',
    indexIdStr: dataIndexStr,
  };
  const selectedItem = selectedItems.find(m => (`${m.indexIdStr},`).indexOf(dataIndexStr) !== -1);
  const isChildAllChecked =
    optionInfo.children?.find(m => !(m.checkStatu === 'all_checked')) === undefined;
  const isChildHaveChecked = optionInfo.children?.find(
    m => (!m.checkStatu || m.checkStatu !== 'none') !== undefined,
  );

  if (selectedItem === undefined || selectedItem == null) {
    // do nothing
  } else if (selectedItem?.indexIdStr === dataIndexStr || isChildAllChecked) {
    defaultOptionProps.checkStatu = 'all_checked';
  } else if (isChildHaveChecked) {
    defaultOptionProps.checkStatu = 'part_checked';
  }

  return {
    label: <OptionCheckStatu {...defaultOptionProps}>{optionInfo.label}</OptionCheckStatu>,
    checkStatu: defaultOptionProps.checkStatu,
  };
}

function buildOptions(param: IBuildOptionsParam): MultipleCascaderOption[] {
  const { selectedItems, data, parentIds } = param;

  if (data == null || data === undefined) {
    return [];
  }

  return data.map(d => {
    const indexIdArr = [...parentIds, d.value ? d.value.toString() : ''];
    const dataChildren =
      d.children && d.children.length > 0
        ? buildOptions({ selectedItems, data: d.children, parentIds: indexIdArr })
        : d.children;
    const info = {
      ...d,
      children: dataChildren,
      text: d.label,
    };
    const labelInfo = buildOptionLabel({
      optionInfo: info,
      selectedItems,
      optionIndexStrArr: indexIdArr,
    });
    info.label = labelInfo.label;
    info.checkStatu = labelInfo.checkStatu;
    return info;
  });
}

function optionConvertToListData(optionList: CascaderOption[], parentIds: string[]): IValueInfo[] {
  if (!optionList) {
    return [];
  }
  const result = optionList.map(m => {
    const { value = '', label = '' } = m;
    return { id: value, addition: m, indexIdStr: [...parentIds, value].join(','), text: label };
  });
  optionList.forEach(m => {
    const { children = [], value = '' } = m;
    if (children.length === 0) {
      return;
    }
    result.push(...optionConvertToListData(children, [...parentIds, value.toString()]));
  });
  return result;
}

export default function MultipleRcCascader(props: IMultipleRcCascaderProps) {
  const [popupVisibleState, setPopupVisible] = useState<boolean>(false);
  const [rcCascaderValue, setRcCascaderValue] = useState<Array<string | number>>([]);
  const [valueItemsState, dispatch] = useReducer(reducer, []);
  const { prefixCls, onChange = () => { }, options = [], onPopupVisibleChange = () => { }, value: propsValue } = props;
  let clickChange = false;

  const optionValueList = useMemo(() => optionConvertToListData(options, []), [options]);

  useEffect(() => {
    onChange(valueItemsState.map(m => m.indexIdStr), valueItemsState.map(m => ({ ...m.addition, indexStr: m.indexIdStr })));
  }, [valueItemsState]);

  useEffect(() => {
    if (propsValue && propsValue.length > 0) {
      return;
    }
    if (valueItemsState.length !== 0) {
      dispatch({ type: 'reset', payload: [] });
    }
  }, [propsValue]);

  const handlePopupVisibleChange = (visible: boolean) => {
    setPopupVisible(visible);
    onPopupVisibleChange(visible);
  };

  const handleChange = (value: string[], selectOptions: CascaderOption[]) => {
    setRcCascaderValue(value);
    //  处理点击空白隐藏。依赖：change 和 onPopupVisibleChange 均为同步事件，而且change 先触发
    clickChange = true;
    if (!selectOptions) {
      return;
    }
    const indexIdStr = value.join(',');
    const selectedOption = selectOptions[selectOptions.length - 1];
    const {
      value: lastOptionValue,
      text: lastOptionText,
      children: lastOptionChildren,
    } = selectedOption;

    if (lastOptionChildren) {
      return;
    }

    const optionsExists = valueItemsState.find(m => m.indexIdStr === indexIdStr) !== undefined;
    if (!optionsExists && lastOptionText && lastOptionValue) {
      dispatch({
        type: 'add',
        payload: [
          { id: lastOptionValue.toString(), text: lastOptionText, indexIdStr, addition: selectedOption },
        ],
      });
    } else if (optionsExists) {
      dispatch({
        type: 'remove',
        payload: [indexIdStr],
      });
    }
  };

  const cascaderOptions = useMemo(() => buildOptions({ selectedItems: valueItemsState, data: options, parentIds: [] }), [valueItemsState, options]);

  return (
    <Context.Provider value={{ dispatch, state: valueItemsState, optionValueList }} >
      <RcCascader
        {...props}
        value={rcCascaderValue}
        onPopupVisibleChange={visible => {
          if (!clickChange) {
            handlePopupVisibleChange(visible);
          }
        }}
        options={cascaderOptions}
        popupVisible={popupVisibleState}
        onChange={handleChange}
        changeOnSelect
      >
        <div
          className={`${prefixCls}-multiple-container`}
          onClick={() => {
            handlePopupVisibleChange(!popupVisibleState);
          }}
        >
          <MultipleInput
            prefixCls={prefixCls}
            active={popupVisibleState}
            valueItems={valueItemsState}
            placeholder={props.placeholder}
            inputIcon={props.inputIcon}
            clearIcon={props.clearIcon}
            onChange={values => {
              dispatch({
                type: 'reset',
                payload: values,
              });
            }}
          />
        </div>
      </RcCascader>
    </Context.Provider>

  );
}
