import React, { Component } from 'react';
import FAChevronDown from 'react-icons/lib/md/keyboard-arrow-down'
import FAMenu from 'react-icons/lib/fa/list-ul'
import FASearch from 'react-icons/lib/fa/search'
import MdEject from 'react-icons/lib/md/eject'
import {COMMUNITY_CHAT,MESSAGE_SENT, MESSAGE_RECIEVED,TYPING,PRIVATE_CHAT} from '../../Events'

export default class SideBar extends Component{
	
	render(){
		const { chats, activeChat, user, setActiveChat, logout, socket,resetChat} = this.props
		return (
			<div id="side-bar">
					<div className="heading">
						<div className="app-name">YK HOLDING CHAT<FAChevronDown /></div>
						<div className="menu">
							<FAMenu />
						</div>
					</div>
					<div className="search">
						<i className="search-icon"><FASearch /></i>
						<input placeholder="Sohbet Ara..." type="text" id="search"/>
						<div className="plus" onClick={() => {socket.emit(PRIVATE_CHAT, resetChat)}}></div>
					</div>
					<div 
						className="users" 
						ref='users' 
						onClick={(e)=>{ (e.target === this.refs.user) && setActiveChat(null) }}>
						{
                            chats.map((chat)=>{
                                if(chat.name){
									const lastMessage = chat.messages[chat.messages.length - 1];
									
                                    const user = chat.users.find(({name})=>{
                                        return name !== this.props.name
                                    }) || { name:chat.name }
                                    const classNames = (activeChat && activeChat.id === chat.id) ? 'active' : ''
                                    
                                    return(
                                    <div 
                                        key={chat.id} 
                                        className={'user ${classNames}'}
                                        onClick={ ()=>{ setActiveChat(chat) } }
                                        >
                                        <div className="user-photo">{user.name[0].toUpperCase()}</div>
                                        <div className="user-info">
                                            <div className="name">{user.name}</div>
                                            {lastMessage && <div className="last-message">{lastMessage.message}</div>}
                                        </div>                                        
                                    </div>
                                )
                                }

                                return null
                            })	
						}
						
					</div>
					<div className="current-user">
						<span>{user.name}</span>
						<div onClick={()=>{logout()}} title="Logout" className="logout">
							<MdEject/>	
						</div>
					</div>
			</div>
		);
	
	}
}