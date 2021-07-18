import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import JsonToTS from 'json-to-ts';
import './panel.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Page() {
  const isJsonStr = (str) =>  {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  const defaultData = [
    {
      key: 'ddadada',
      value: ['dadajkj0908', 'hdahdkadakdak'],
      show: true
    },
    {
      key: 'ddadada',
      value: ['dadajkj0908', 'hdahdkadakdak'],
      show: true
    },
    {
      key: 'ddadada',
      value: ['dadajkj0908', 'hdahdkadakdak'],
      show: true
    }
  ]

  const [list, setList] = useState([])
  
  const [toggle, setToggle] = useState(true)

  const myStateRef = React.useRef(list);

  /**
   * 单条数据点击
   */
  const onItemClick = useCallback((i) => {
    const newList = list.map((e, index) => ({...e, show: index === i ? !e.show : e.show}))
    setList(newList)
  }, [list, setList])
  
  /**
   * 复制
   */
  const doCopy = (event, values) => {
    event.stopPropagation();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', values);
    input.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      toast('🦄 复制成功!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    document.body.removeChild(input);
  }

  /**
   * render 单条数据
   */
  const renderItem = (arr) => <>{arr.map(e => <p>{e}<button onClick={(event) => doCopy(event, e)} className="mybutton">复制</button></p>)}</>
  
  const requestCallback = async (args) => {
      const [{
        // 请求的类型，查询参数，以及url
        request: { method, queryString, url },
        getContent,
      }] = args;
      const content = await new Promise((res, rej) => getContent(res));
      const isJson = isJsonStr(content)
      if (isJson) {
        const data = JSON.parse(content)
        const tsinterface = JsonToTS(data)
        const nowList = myStateRef.current
        const hasSameUrl = nowList.some(e => e.key === url)
        if (hasSameUrl) {
          return;
        }
        const newList = [...nowList, {
          key: url,
          value: tsinterface,
          show: true
        }]
        myStateRef.current = newList;
        setList(newList)
      }
  }
  
  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener((...args) => requestCallback(args));
  }, [])
  
  /**
   * 清空数据
   */
  const doClear = useCallback(() => {
    setList([])
    myStateRef.current = [];
  }, [list, setList])


  /**
   * 收起展开
   */
  const doToggle = useCallback(() => {
    if (list.length === 0) {
      return;
    }
    const newList = list.map(e => ({...e, show: !toggle}))
    setToggle(!toggle)
    setList(newList)
    myStateRef.current = newList;
  }, [list, setList, toggle, setToggle])

  return (
    <div>
      <div className="bg"></div>
      <ToastContainer />
      <div className="action">
        <button onClick={() => doToggle()} className="actbutton">{toggle ? '收起' : '展开'}</button>
        <button onClick={() => doClear()} className="actbutton">清空数据</button>
      </div>
      {
        list.map((e, i) => (
          <div className="content" onClick={() => onItemClick(i)}>
            <p className="urlname">{e.key}</p>
            {e.show && <div>{renderItem(e.value)}</div>}
          </div>
        ))
      }
    </div>
  )
}

export default Page;