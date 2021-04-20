import React, { useEffect, useState } from 'react'
import { pubClient } from './rest-client'
import { v4 as uuid } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleDown, faArrowAltCircleUp, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

export default () => {
    const CONSTRUCT = { id: '', orderBy: 0, priority: 0, title: '' }
    const [content, setContent] = useState()
    const [tempTitle, setTempTitle] = useState('')
    const [editable, setEditable] = useState('')
    const [ready, setReady] = useState(false)


    useEffect(() => {
        handleLoad()
    }, [])


    const handleLoad = async () => {
        const { data } = await pubClient.get('todolist')
        setContent([...data])
    }

    function handleEnter() {
        if (tempTitle) {
            const temp = { id: uuid(), orderBy: content.length > 0 ? content[content.length - 1].orderBy + 1 : 0, priority: 0, title: tempTitle }
            content.push(temp)
            setTempTitle('')
            pubClient.post(temp, 'todolist')
        }

    }


    function handleFocus(index) {
        setEditable(index)
    }

    function handleChange(index, event) {
        const value = event.target.value
        setContent(prev=>{
            console.log('prev')
            console.log(prev)
            prev[index]={...prev[index], title: value}
            pubClient.put(prev[index], 'todolist')
            return [...prev]
        })
        
    }

    async function handleDelete(index) {
        const id = content[index].id
        const { data } = await pubClient.delete(id, 'todolist')
        setContent([...data])
    }

    async function handleswap(index, swap) {
        const lastIndex = content.length - 1
        if (index !== lastIndex || index !== 0) {
            setContent(prev=>{
                let temp = [...prev]
                temp[index]={...prev[index+swap], orderBy: prev[index].orderBy}
                temp[index+swap]={...prev[index], orderBy: prev[index+swap].orderBy}
                pubClient.put(temp[index], 'todolist')
            pubClient.put(temp[index + swap], 'todolist')
                return [...temp]
            })
        }

    }

    return (
        <>
            <div className='no-gutters'>
                <h1 >Todo List</h1>
                <div className='text-start'>
                    <label>輸入代辦事項</label>
                    <div className='d-flex justify-content-between'>
                        <input
                            type='text'
                            name='todoTitle'
                            className='form-control'
                            value={tempTitle}
                            onChange={event => setTempTitle(event.target.value)}
                            onKeyDown={event => { if (event.keyCode === 13) { handleEnter() } }}
                        />
                        <button
                            className='form-control w-25'
                            onClick={handleEnter}
                        >輸入
                        </button>
                    </div>
                </div>
                <hr />
                <div className='text-start form-group px-3'>
                    {content?.map((rowData, index) => (
                        <div className='card shadow-sm mt-2 px-3 d-flex row' key={index} onClick={() => { handleFocus(index) }}>
                            <div className="input-group my-1">
                                <div className="input-group-prepend">
                                    <div className="input-group-text p-3">
                                        <input type="checkbox"
                                            aria-label="Checkbox for following text input"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control mr-1 border-0 border-bottom bg-light"
                                    aria-label="Text input with checkbox"
                                    value={rowData.title}
                                    disabled={editable !== rowData.orderBy}
                                    onChange={event => handleChange(index, event)}
                                    onBlur={() => setEditable('')}
                                    onKeyDown={event => { if (event.keyCode === 13) { setEditable('') } }}
                                />
                                <div className='d-flex justify-content-between'>
                                    <button
                                        className='btn px-1'
                                        disabled={rowData.orderBy === 0}
                                        onClick={() => {
                                            handleswap(index, -1)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faArrowAltCircleUp} size='lg' />
                                    </button>

                                    <button
                                        className='btn px-1'
                                        disabled={rowData.orderBy === (content.length - 1)}
                                        onClick={() => {
                                            handleswap(index, 1)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faArrowAltCircleDown} size='lg' />
                                    </button>
                                    <button
                                        className='btn px-1'
                                        onClick={() => { handleDelete(index) }}
                                    >
                                        <FontAwesomeIcon icon={faTimesCircle} size='lg' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )

}