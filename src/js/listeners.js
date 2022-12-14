
import Project from "./project";
import task from "./task";
import { displayTasks, toggleTaskForm, toggleAddTaskButton, toggleProjectForm, createProjectList, showModal, hideModal } from "./renderUI";
import { getProjects, updateProjects, getProjectIndex, removeProject} from "./project";
import { initializeMethods } from "./list";
import { isToday, isThisWeek } from 'date-fns'

export default addEventListeners;
export { addTaskRemoveListener, addProjectListeners, addEditTaskListener, addSaveEditTaskListener, addCancelEditTaskListener, addModalListeners };

/**
 * Adds event listeners
 */
function addEventListeners(){
    addSidebarListeners();
    addTaskListeners();
    addProjectListeners();
    enableSubmitButtonListeners();
}

function addTaskListeners(){
    addTaskInterfaceToggle();
    addTaskSubmitListener();
}

function addProjectListeners(){
    addProjectInterfaceToggle();
    addProjectSubmitListener();
    addProjectItemListeners()
    addRemoveProjectListeners();
}

//Adds event listeners to sidebar components
function addSidebarListeners(){
    const inbox = document.querySelector('.top-sidebar > li:nth-child(1)');
    
    //For inbox project
    inbox.onclick = () => {
        displayTasks(getProjects('Inbox'));
        toggleTaskForm('hide');
        toggleProjectForm('hide');
        toggleSelectedProjectListeners();
    }

    //Add listeners for user created projects
    addProjectItemListeners();

    //Add listeners for 'Today' and 'Upcoming' projects
    addUpcomingListeners();
}

/**
 * Adds event listeners to add task button and cancel button
 * inside of add task form
 */
function addTaskInterfaceToggle(){
    const addButton = document.querySelector('.add-task-button');
    const cancelButton = document.querySelector('.task-cancel-button');
    
    addButton.onclick = () => {
        toggleTaskForm('show');
        toggleEditTaskContainers();
        toggleProjectForm('hide');
    }

    cancelButton.onclick = () => {
        toggleTaskForm('hide');
    }
   
}

/**
 * Adds listener to submit button in task form 
 */
function addTaskSubmitListener(){
    const submitButton = document.querySelector('.task-submit-button');
    
    submitButton.onclick = () => {
        //Get current project's name
        const projectName = document.querySelector('.tasks').getAttribute('data-project-name');

        //Get values from form elements once button is clicked
        const taskName = document.querySelector('#task-name');
        const taskDescription = document.querySelector('#task-description');
        const taskDate = document.querySelector('#task-date');
        const taskPriority = document.querySelector('#task-priority');

        //Create a new task with from values
        let newTask = task(taskName.value.trim(), 
            taskDescription.value.trim(), 
            taskDate.valueAsDate, 
            taskPriority.value, 
            projectName);


        if(projectName === 'Inbox'){
            //Get project add new task
            let projectCopy = getProjects(projectName);
            projectCopy.add(newTask);

            //Update local storage
            localStorage.setItem(projectName, JSON.stringify(projectCopy));
            
            //Display tasks
            displayTasks(getProjects(projectName));

           } else {
            //Get project and its index
             let projects = getProjects('all');
             let projectIndex = getProjectIndex(projectName);

             //Add task to project
             projects[projectIndex].add(newTask);

             //Update project
             updateProjects(projects[projectIndex]);
             
             //Display tasks
             displayTasks(getProjects(projectName));
           } 

        
        //Reset form values
        taskName.value = '';
        taskDescription.value = '';
        taskDate.value = '';
        taskPriority.value = 1;
        //Disable submit button by default
        submitButton.disabled = true;

    }
}

/**
 * Adds listener to remove buttons in each task container
 * Won't be added to addTaskListeners, is called in displayTasks()
 */
function addTaskRemoveListener(){
    const removeButtons = document.querySelectorAll('.remove-task-button'); 

    removeButtons.forEach((button) => {
        button.onclick = () => {
        //Get reference to task container
        const taskContainer = button.parentNode.parentNode;
        
        //Get project name
        let projectName = document.querySelector('.tasks').getAttribute('data-project-name');
        //Get task ID
        let taskID = taskContainer.getAttribute('data-task-id');
        
        let projectCopy;
        //Will be used if project is 'Today' or 'Upcoming'
        let projectReference; 

            if (projectName === 'Today' || 
                projectName === 'Upcoming'){

                projectCopy = getProjects(projectName);
                //Get the task ID of the project
                taskID = projectCopy.tasks[taskID].id;
                
                //Get the project that the task comes from
                projectReference = getProjects(projectCopy.tasks[taskID].project);
                projectReference.delete(taskID);
                //Update project task came from
                updateProjects(projectReference);
                
                //Display 'Today' or 'Upcoming'
                getUpcomingProjects(projectName);

            } else {
                //Get project, delete task and update
                projectCopy = getProjects(projectName); 
                projectCopy.delete(taskID);
                updateProjects(projectCopy);

                displayTasks(getProjects(projectName));
            }
            
            toggleProjectForm('hide');
        }
    });  
}

/**
 * Add listeners to edit task buttons in task containers
 */
function addEditTaskListener(){
    const editButtons = document.querySelectorAll('.edit-task-button');

    editButtons.forEach((button) => {
        button.onclick = () => {
            //Get the id of the current task
            let taskId = button.parentNode.parentNode.getAttribute('data-task-id');

            //Hide task buttons and task info
            const taskInfo = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-info`);
            taskInfo.style.display = 'none'

            const taskButtons = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-buttons`);
            taskButtons.style.display = 'none';

            //Show current task container
            const editTaskContainer = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .edit-task-container`);
            toggleEditTaskContainers(editTaskContainer);

            toggleTaskForm('hide');
            toggleProjectForm('hide');

        }
    })
}

/**
 * Add event listeners to cancel button in edit
 * task form
 */
function addCancelEditTaskListener(){
    const cancelEditButtons = document.querySelectorAll('.cancel-edit-button');

    cancelEditButtons.forEach((button) => {
        button.onclick = () => {
            //Get task ID
            let taskId = button.parentNode.parentNode.parentNode.getAttribute('data-task-id');
            
            //Show task info and task buttons
            const taskInfo = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-info`);
            taskInfo.style.display = 'block';

            const taskButtons = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-buttons`);
            taskButtons.style.display = 'block';

            //Hide edit task form
            const editContainer = button.parentNode.parentNode;
            editContainer.style.display = 'none';    
        }
    });
}

/**
 * Will hide every edit task container except for the
 * one passed as a parameter
 * 
 * @param {node} thisContainer 
 */
function toggleEditTaskContainers(thisContainer){
    //If no argument is passed, all edit task container are hidden
    const allTaskContainers = document.querySelectorAll('.edit-task-container');

    allTaskContainers.forEach((container) => {
        if(container !== thisContainer){
            //Get the task id associated with the container
            let thisTaskId = container.parentNode.getAttribute('data-task-id');
            //Get the task info and buttons using the task id
            let thisTaskInfo = document.querySelector(`.task-container[data-task-id="${thisTaskId}"] > .task-info`);
            let thisTaskButtons = document.querySelector(`.task-container[data-task-id="${thisTaskId}"]  .task-buttons`);

            //Show the task info and buttons
            thisTaskInfo.style.display = 'flex';
            thisTaskButtons.style.display = 'block';

            //Hide the edit container
            container.style.display = 'none';

        } else {
            //If the container matches the one in the parameter, show it
            container.style.display = 'block';
        }
    })
}

/**
 * Add listeners to 'save edit' button inside of
 * edit task containers
 */
function addSaveEditTaskListener(){
    const saveEditButtons = document.querySelectorAll('.save-edit-button');

    saveEditButtons.forEach((button) => {
        button.onclick = () => {
            let projectName = document.querySelector('.tasks').getAttribute('data-project-name');
            let projectCopy = getProjects(projectName);

            //Get the task container associated with this edit container
            let taskContainer = button.parentNode.parentNode.parentNode;

            let taskID = taskContainer.getAttribute('data-task-id');
            //Get the 'true' id attribute of the task 
            taskID = projectCopy.tasks[taskID].id;

            //Get the project of the task using its project attribute
            let projectReference = getProjects(projectCopy.tasks[taskID].project);

            //Get values from the edit container form
            let newName = taskContainer.querySelector('#new-task-name').value.trim();
            let newDescription = taskContainer.querySelector('#new-task-description').value.trim();
            let newDate = taskContainer.querySelector('#new-task-date').valueAsDate ;
            let newPriority = taskContainer.querySelector('#new-task-priority').value;
            
            //Update the project's reference
            projectReference.tasks[taskID].title = newName;
            projectReference.tasks[taskID].description = newDescription;
            projectReference.tasks[taskID].dueDate = newDate;
            projectReference.tasks[taskID].priority = newPriority;

            //Update the actual project
            updateProjects(projectReference); 

            //Display tasks
            if(projectName === 'Today' || 
               projectName === 'Upcoming'){

                getUpcomingProjects(projectName);

               } else {
                displayTasks(getProjects(projectName));

               }
        }  
    });
}

/**
 * Add event listeners to add project button and 
 * cancel button inside of interface.
 */
function addProjectInterfaceToggle(){
    const addButton = document.querySelector('.add-project-button');
    const cancelButton = document.querySelector('.cancel-project-button');


    addButton.onclick = () => {
        let projectName = document.querySelector('.tasks').getAttribute('data-project-name');
        toggleProjectForm('show');
        toggleTaskForm('hide');
        toggleEditTaskContainers();
        
        //Hide add task button if currently looking at Upcoming or Today projects
        if(projectName === 'Upcoming' || projectName === 'Today'){
            toggleAddTaskButton('hide');
        }

    }


    const errorMessage = document.querySelector('.error-message');
    //Hide project form and error message 
    cancelButton.onclick = () => {
        toggleProjectForm('hide');
        errorMessage.style.display = 'none';
    }


}

/**
 * Add event listeners to project submit button in 
 * add project interface.
 */
function addProjectSubmitListener(){
    const submitButton = document.querySelector('.submit-project-button');
    const errorMessage = document.querySelector('.add-project-interface > .error-message');
    let projects = getProjects('all');

    submitButton.onclick = () => {
        const projectName = document.querySelector('#project-name');
        
        if(projectName.value){

            let uniqueName = true;

            //Check for unique project name
            projects.forEach(project => {
                if(project.name === projectName.value){          
                    uniqueName = false;   
                }
            });

            //Display error message
            if(!uniqueName){
                projectName.value = '';
                errorMessage.style.display = 'block';
                return;
            }

            let newProject = new Project(projectName.value.trim());

            //Display new project
            displayTasks(getProjects(projectName.value));
            
            //Reset project form
            projectName.value = '';
            submitButton.disabled = 'true';

            toggleProjectForm('hide');
            createProjectList('reset');
            toggleAddTaskButton('show');
            toggleSelectedProjectListeners();
        }
    }
}

/**
 * Add event listeners to remove project button inside of
 * project listing
 */
function addRemoveProjectListeners(){
    const removeButtons = document.querySelectorAll('.project-listing > button');
    const projectList = document.querySelectorAll('.projects-container > .project-listing');

    //Go through removeButtons node list
   for (let i = 0; i < removeButtons.length; i++) {
        const button = removeButtons[i];

        let projectsCopy = getProjects('all');
        let projectName = projectList[i].childNodes[0].innerText;
        let projectIndex = getProjectIndex(projectName);

        button.onclick = (e) => {
            //Prevent event from bubbling
            e.stopPropagation();

            //
            projectsCopy.splice(projectIndex, 1);

            //If there are any user created projects
            if(projectsCopy[0]){
                removeProject(projectName);
                createProjectList('reset');
            } else {
                //If there are no more projects, remove 'projects' item from storage
                localStorage.removeItem('projects');
                //Clear list
                createProjectList('clear');
            }
            
            displayTasks(getProjects('Inbox'));
            toggleSelectedProjectListeners();
        }
    
   }
}

/**
 * Add listeners to each user made project listing
 */
function addProjectItemListeners(){
    const projectList = document.querySelectorAll('.projects-container > .project-listing');
    
    projectList.forEach((projectItem) => {

        //Get project name;
        let projectName = projectItem.childNodes[0].innerText;
            
        projectItem.onclick = () => {
                displayTasks(getProjects(projectName));

                //Hide form containers
                toggleTaskForm('hide');
                toggleProjectForm('hide');
                toggleEditTaskContainers();

                //Show project as selected
                toggleSelectedProjectListeners();
         }
     });
 
}

/**
 * Enables submit buttons only if there is a valid task/project name
 */
function enableSubmitButtonListeners(){
    //Task name input and submit task button
    const taskName = document.querySelector('#task-name');
    const taskSubmit = document.querySelector('.task-submit-button');
    
    //Project name input and submit project button
    const projectName = document.querySelector('#project-name');
    const projectSubmit = document.querySelector('.submit-project-button');

    //Edit task name input
    const newTaskName = document.querySelectorAll('#new-task-name');


    taskName.oninput = () => {
        if(taskName.value.trim()){
            taskSubmit.disabled = false; 
        }else {
            taskSubmit.disabled = true;  
        }
    }


    projectName.oninput = () => {
        if(projectName.value.trim()){
            projectSubmit.disabled = false;
        } else {
            projectSubmit.disabled = true; 
        }
    }

    newTaskName.forEach(name => {
        name.oninput = () =>{
            //Get the save edit button associated with newTaskName
            const saveEditButton = name.parentNode.childNodes[4].querySelector('button:nth-child(1)');
            
            if(name.value.trim()){
                saveEditButton.disabled = false;
            } else {
                saveEditButton.disabled = true;      
            }
        }
    });

}

/**
 * Add listeners to 'Today' and 'Upcoming' project 
 * listings
 */
function addUpcomingListeners(){
    const todayListing = document.querySelector('.top-sidebar > li:nth-child(2)');
    const upcomingListing = document.querySelector('.top-sidebar > li:nth-child(3)');
    
    //Display 'Today' project
    todayListing.onclick = () => {
        getUpcomingProjects('Today');
    }

    //Display 'Upcoming' project
    upcomingListing.onclick = () => {
      getUpcomingProjects('Upcoming');
    }
      
}

/**
 * Apply 'selected-project' class to project listing of project 
 * currently being viewed and remove the class from other projects
 */
function toggleSelectedProjectListeners(){
    //Get 'Inbox', 'Today', and 'Upcoming' projects
    const defaultProjects = document.querySelectorAll('.top-sidebar li');
    //Get user created projects
    const otherProjects = document.querySelectorAll('.projects-container div');
    
    const projectName = document.querySelector('.tasks').getAttribute('data-project-name');

    /**
     * These two forEach() loops will find the project listing
     * of the project being viewed and apply the 'selected-project'
     * class.
     */

    defaultProjects.forEach(project => {
        if(project.innerText !== projectName){
            project.classList.remove('selected-project');
        } else {
            project.classList.add('selected-project'); 
        }
    });

    otherProjects.forEach(project => {
        let listingName = project.querySelector('p').innerText;
        if(listingName !== projectName){
            project.classList.remove('selected-project');
        } else {
            project.classList.add('selected-project'); 
        }
        
    });
    
}

/**
 * Allow user to open and close modal to view task
 * information.
 */
function addModalListeners(){
    //Close button inside of modal content container
    const closeButton = document.querySelector('.close-button-container > button');
    //Info buttons inside of each task container
    const infoButtons = document.querySelectorAll('.task-info-button');

    closeButton.onclick = hideModal;

    //Each info button will show modal
    infoButtons.forEach(button => {
        button.onclick = showModal;
    });

    //If user clicks outside of modal content, hide modal
    const modal = document.querySelector('.modal');
    window.addEventListener('mousedown', (e) => {
        if(e.target === modal){
            hideModal();
        }
    })
}

/**
 * Gets and displays either the 'Today' project or the
 * 'Upcoming' project
 * 
 * @param {string} projectName 
 */
function getUpcomingProjects(projectName){

    //Get Project and reset list
    let upcomingProject = getProjects(projectName);
    upcomingProject.resetList();
    //Get 'Inbox' project
    let inbox = getProjects('Inbox');
    let projectsCopy;
    //If there are user created projects present or inbox has tasks
    if(localStorage.getItem('projects') || inbox.tasks){
        projectsCopy = getProjects('all');
        //Add inbox to projectsCopy so all tasks are checked
        projectsCopy.push(inbox);
        

        projectsCopy.forEach(project => {

            project.tasks.forEach(task => {
                //Add all projects that are due today to 'Today' project
                if(projectName === 'Today'){
                    if(isToday(new Date(task.dueDate))){
                        let taskCopy = task;
                        //Keep the original project and id attribute of task
                        taskCopy.projectName = task.project;
                        taskCopy.id = task.id;
                        upcomingProject.add(taskCopy);
                   }
                } else if (projectName === 'Upcoming'){
                    //Add all projects that are due this week to 'Upcoming' project
                    if(isThisWeek(new Date(task.dueDate))){
                        let taskCopy = task;
                        taskCopy.projectName = task.project;
                        taskCopy.id = task.id;
                        upcomingProject.add(taskCopy);
                   }
                }
              
            })
        });

        //Update project in storage
        localStorage.setItem(projectName, JSON.stringify(upcomingProject));

        //Display project
        displayTasks(getProjects(projectName));

        toggleTaskForm('hide');
        toggleProjectForm('hide');
        toggleAddTaskButton('hide');
        toggleSelectedProjectListeners();
    }

}
