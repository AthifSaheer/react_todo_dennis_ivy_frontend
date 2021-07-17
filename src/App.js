import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList : [],
      activeItem : {
        id : null,
        title : "",
        complete : false,
      },
      editing : false,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.taskComplete = this.taskComplete.bind(this)
  }
  
  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  componentDidMount(){
    this.fetchTasks()
  }

  fetchTasks(){
    console.log("fetching....")
    fetch("http://127.0.0.1:8000/api/task-list/").then(response => response.json())
    .then(data => this.setState({
      todoList: data
    }))
  }

  handleChange(e) {
    var name = e.target.name
    var value = e.target.value
    this.setState({
      activeItem : {
        ...this.state.activeItem,
        title : value
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    var csrftoken = this.getCookie("csrftoken")
    var url = "http://127.0.0.1:8000/api/task-create/"

    if (this.state.editing == true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false,
      })
    }

    fetch(url, {
      method : 'POST',
      headers : {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body : JSON.stringify(this.state.activeItem)
    }).then(response => {
      this.fetchTasks()
      this.setState({
        activeItem : {
          id : null,
          title : "",
          complete : false,
        },
      })
    }).catch(function(error) {
      console.log("Error: ", error)
    })
  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editing:true,
    })
  }

  deleteItem(task) {
    var csrftoken = this.getCookie("csrftoken")

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method : 'DELETE',
      headers : {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
    }).then( () => {
      this.fetchTasks()
    } )
  }

  taskComplete(task) {
    var csrftoken = this.getCookie("csrftoken")
    task.completed = !task.completed

    console.log("false", task.completed)
    
    fetch(`http://127.0.0.1:8000/api/task-update/${task.id}/`, {
      method : 'POST',
      headers : {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body : JSON.stringify({'completed' : task.completed, 'title' : task.title})
    }).then( () => {
      this.fetchTasks()
    })
  }

  render(){
    var tasks = this.state.todoList
    var self = this
    return(
        <div className="container">

          <div id="task-container">
              <div  id="form-wrapper">
                 <form onSubmit={this.handleSubmit} id="form">
                    <div className="flex-wrapper">
                        <div style={{flex: 6}}>
                            <input onChange={this.handleChange} value={this.state.activeItem.title} className="form-control" id="title" type="text" name="title" placeholder="Add task.." />
                         </div>

                         <div style={{flex: 1}}>
                            <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                          </div>
                      </div>
                </form>
             
              </div>

              <div  id="list-wrapper">
                { tasks.map(function(task, index) {
                  return(
                    <div key={index} className="task-wrapper flex-wrapper">
                      
                      <div style={{flex:6}}>
                        { task.completed == false ? (
                          <span>{ task.title }</span>
                          ) : (
                            <strike>{ task.title }</strike>
                        ) }
                      </div>

                      <div style={{flex:1}}>
                        <button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">🖋️</button>
                      </div>

                      <div style={{flex:1}}>
                        <button onClick={() => self.taskComplete(task)} className="btn btn-sm btn-outline-warning">✔</button>
                      </div>

                      <div style={{flex:1}}>
                        <button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark delete">-</button>
                      </div>

                    </div>
                  )
                }) }
              </div>
          </div>
          
        </div>
      )
  }

}
