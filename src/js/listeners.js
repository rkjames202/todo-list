
import Project from "./project";
import task from "./task";
import { displayTasks, toggleTaskForm, toggleAddTaskButton, toggleProjectForm, createProjectList, showModal, hideModal } from "./renderUI";
import { getProjects, updateProjects, getProjectIndex, removeProject} from "./project";
import { initializeMethods } from "./list";
import { isToday, isThisWeek } from 'date-fns'

export default addEventListeners;
export { addTaskRemoveListener, addProjectListeners, addEditTaskListener, addSaveEditTaskListener, addCancelEditTaskListener, addModalListeners };


function addEventListeners(){
    addSidebarListeners();
    addTaskListeners();
    addProjectListeners();
    enableSubmitButtonListeners();
}

function addSidebarListeners(){
    const inbox = document.querySelector('.top-sidebar > li:nth-child(1)');

    inbox.onclick = () => {
        displayTasks(JSON.parse(localStorage.getItem('Inbox')));
        toggleTaskForm('hide');
        toggleProjectForm('hide');
        toggleSelectedProjectListeners();
    }

    addProjectItemListeners();
    addUpcomingListeners();

    //Get each task from all projects and display ones with a due date of today
    //Do the same for the ones that have a due date within the week

}

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

function addTaskSubmitListener(){
    const submitButton = document.querySelector('.task-submit-button');
    
    submitButton.onclick = () => {
        //Get values once button is clicked
        const taskName = document.querySelector('#task-name');
        const taskDescription = document.querySelector('#task-description');
        const taskDate = document.querySelector('#task-date');
        const taskPriority = document.querySelector('#task-priority');
        const projectName = document.querySelector('.tasks').getAttribute('data-project-name');
        
        let newTask = task(taskName.value.trim(), 
            taskDescription.value.trim(), 
            taskDate.valueAsDate, 
            taskPriority.value, 
            projectName);


        if(projectName === 'Inbox' ||
           projectName === 'Today' ||
           projectName == 'Upcoming'){
            
            let projectCopy = JSON.parse(localStorage.getItem(projectName));
            projectCopy = initializeMethods.call(projectCopy);

            projectCopy.add(newTask);
            localStorage.setItem(projectName, JSON.stringify(projectCopy));
            displayTasks(JSON.parse(localStorage.getItem(projectName)));

           } else {
             let projects = getProjects('all');
             let projectIndex = getProjectIndex(projectName);

             projects[projectIndex].add(newTask);

             updateProjects(projects[projectIndex]);
             
             displayTasks(getProjects(projectName));
           } 

        

        taskName.value = '';
        taskDescription.value = '';
        taskDate.value = '';
        taskPriority.value = 1;
        submitButton.disabled = true;

    }
}

/**
 * Won't be added to addTaskListeners, is called in displayTasks()
 */
function addTaskRemoveListener(){
    const removeButtons = document.querySelectorAll('.remove-task-button'); 

    removeButtons.forEach((button) => {
        button.onclick = () => {
        const taskContainer = button.parentNode.parentNode;

        let projectName = document.querySelector('.tasks').getAttribute('data-project-name');
        let taskID = taskContainer.getAttribute('data-task-id');
            
        let projectCopy;
        let projectReference;

            if (projectName === 'Today' || 
                projectName === 'Upcoming'){

                projectCopy = getProjects(projectName);
                taskID = projectCopy.tasks[taskID].id;

                projectReference = getProjects(projectCopy.tasks[taskID].project);
                projectReference.delete(taskID);
                updateProjects(projectReference);
                
                getUpcomingProjects(projectName);

            } else {

                projectCopy = getProjects(projectName); 
                projectCopy.delete(taskID);
                updateProjects(projectCopy);

                displayTasks(getProjects(projectName));
            }
                 

            

            toggleProjectForm('hide');
        }
    });  
}

function addEditTaskListener(){
    const editButtons = document.querySelectorAll('.edit-task-button');

    editButtons.forEach((button) => {
        button.onclick = () => {
            let taskId = button.parentNode.parentNode.getAttribute('data-task-id');

            const taskInfo = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-info`);
            taskInfo.style.display = 'none'

            const taskButtons = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-buttons`);
            taskButtons.style.display = 'none';

            const editTaskContainer = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .edit-task-container`);
            toggleEditTaskContainers(editTaskContainer);

            toggleTaskForm('hide');
            toggleProjectForm('hide');

        }
    })
}

function addCancelEditTaskListener(){
    const cancelEditButtons = document.querySelectorAll('.cancel-edit-button');

    cancelEditButtons.forEach((button) => {
        button.onclick = () => {
            //Shorten this
            let taskId = button.parentNode.parentNode.parentNode.getAttribute('data-task-id');
        
            const taskInfo = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-info`);
            taskInfo.style.display = 'block';

            const taskButtons = document.querySelector(`.task-container[data-task-id = "${taskId}"] > .task-buttons`);
            taskButtons.style.display = 'block';

            const editContainer = button.parentNode.parentNode;
            editContainer.style.display = 'none';    
        }
    });
}

/**
 * If no argument is passed, edit task containers are hidden
 * @param {*} thisContainer 
 */
function toggleEditTaskContainers(thisContainer){
    const allTaskContainers = document.querySelectorAll('.edit-task-container');

    allTaskContainers.forEach((container) => {
        if(container !== thisContainer){
            let thisTaskId = container.parentNode.getAttribute('data-task-id');
            let thisTaskInfo = document.querySelector(`.task-container[data-task-id="${thisTaskId}"] > .task-info`);
            let thisTaskButtons = document.querySelector(`.task-container[data-task-id="${thisTaskId}"]  .task-buttons`);

            thisTaskInfo.style.display = 'flex';
            thisTaskButtons.style.display = 'block';

            container.style.display = 'none';

        } else {
            container.style.display = 'block';
        }
    })
}

function addSaveEditTaskListener(){
    const saveEditButtons = document.querySelectorAll('.save-edit-button');

    saveEditButtons.forEach((button) => {
        button.onclick = () => {
            let projectName = document.querySelector('.tasks').getAttribute('data-project-name');
            let projectCopy = getProjects(projectName);

            let taskContainer = button.parentNode.parentNode.parentNode;

            let taskID = taskContainer.getAttribute('data-task-id');
            taskID = projectCopy.tasks[taskID].id;

            let projectReference = getProjects(projectCopy.tasks[taskID].project);

            let newName = taskContainer.querySelector('#new-task-name').value.trim();
            let newDescription = taskContainer.querySelector('#new-task-description').value.trim();
            let newDate = taskContainer.querySelector('#new-task-date').valueAsDate ;
            let newPriority = taskContainer.querySelector('#new-task-priority').value;
        
            projectReference.tasks[taskID].title = newName;
            projectReference.tasks[taskID].description = newDescription;
            projectReference.tasks[taskID].dueDate = newDate;
            projectReference.tasks[taskID].priority = newPriority;

            updateProjects(projectReference); 


            if(projectName === 'Today' || 
               projectName === 'Upcoming'){

                getUpcomingProjects(projectName);

               } else {
                displayTasks(getProjects(projectName));

               }
        }  
    });
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

function addProjectInterfaceToggle(){
    const addButton = document.querySelector('.add-project-button');
    const cancelButton = document.querySelector('.cancel-project-button');

    addButton.onclick = () => {
        const projectName = document.querySelector('.tasks').getAttribute('data-project-name');
        toggleProjectForm('show');
        toggleTaskForm('hide');
        toggleEditTaskContainers();
        
        if(projectName === 'Upcoming' || projectName === 'Today'){
            toggleAddTaskButton();
        }

    }

    const errorMessage = document.querySelector('.error-message');
    cancelButton.onclick = () => {
        toggleProjectForm('hide');
        errorMessage.style.display = 'none';
    }


}

function addProjectSubmitListener(){
    const submitButton = document.querySelector('.submit-project-button');
    const errorMessage = document.querySelector('.add-project-interface > .error-message');
    let projects = getProjects('all');

    submitButton.onclick = () => {
        const projectName = document.querySelector('#project-name');
        
        //Display error message
        if(projectName.value){

            let uniqueName = true;

            projects.forEach(project => {
                if(project.name === projectName.value){          
                    uniqueName = false;   
                }
            });

            if(!uniqueName){
                projectName.value = '';
                errorMessage.style.display = 'block';
                return;
            }

            let newProject = new Project(projectName.value.trim());

            displayTasks(getProjects(projectName.value));
            
            projectName.value = '';
            submitButton.disabled = 'true';

            toggleProjectForm('hide');
            createProjectList('reset');
            toggleSelectedProjectListeners();
        }
    }
}

function addRemoveProjectListeners(){
    const removeButtons = document.querySelectorAll('.project-listing > button');
    const projectList = document.querySelectorAll('.projects-container > .project-listing');

   for (let i = 0; i < removeButtons.length; i++) {
        const button = removeButtons[i];

        let projectsCopy = getProjects('all');
        let projectName = projectList[i].childNodes[0].innerText;
        let projectIndex = getProjectIndex(projectName);

        button.onclick = (e) => {
            //Prevent addProjectItemListeners from bubbling
            e.stopPropagation();

            projectsCopy.splice(projectIndex, 1);

            if(projectsCopy[0]){
                removeProject(projectName);
                createProjectList('reset');
            } else {
                localStorage.removeItem('projects');
                createProjectList('clear');
            }
            
            displayTasks(getProjects('Inbox'));
            toggleSelectedProjectListeners();
        }
    
   }
}

function addProjectItemListeners(){
    const projectList = document.querySelectorAll('.projects-container > .project-listing');
    projectList.forEach((projectItem) => {

        //Get paragraph node
        let projectName = projectItem.childNodes[0].innerText;
            projectItem.onclick = () => {
                displayTasks(getProjects(projectName));
                
                toggleTaskForm('hide');
                toggleProjectForm('hide');
                toggleEditTaskContainers();
                toggleSelectedProjectListeners();
         }
     });
 
}

/**
 * Enables submit buttons only if there is a valid task/project name
 */
function enableSubmitButtonListeners(){
    const taskName = document.querySelector('#task-name');
    const taskSubmit = document.querySelector('.task-submit-button');
    
    const projectName = document.querySelector('#project-name');
    const projectSubmit = document.querySelector('.submit-project-button');

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
            const saveEditButton = name.parentNode.childNodes[4].querySelector('button:nth-child(1)');
        
            if(name.value.trim()){
                saveEditButton.disabled = false;
            } else {
                saveEditButton.disabled = true;      
            }
        }
    });

}

function addUpcomingListeners(){
    const todayListing = document.querySelector('.top-sidebar > li:nth-child(2)');

    todayListing.onclick = () => {
        getUpcomingProjects('Today');
    }

    const upcomingListing = document.querySelector('.top-sidebar > li:nth-child(3)');

    upcomingListing.onclick = () => {
      getUpcomingProjects('Upcoming');
    }
      
}

function toggleSelectedProjectListeners(){
    const defaultProjects = document.querySelectorAll('.top-sidebar li');
    const otherProjects = document.querySelectorAll('.projects-container div');
    const projectName = document.querySelector('.tasks').getAttribute('data-project-name');


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

function addModalListeners(){
    const closeButton = document.querySelector('.close-button-container > button');
    const infoButtons = document.querySelectorAll('.task-info-button');

    closeButton.onclick = hideModal;

    infoButtons.forEach(button => {
        button.onclick = showModal;
    });

    const modal = document.querySelector('.modal');
    window.addEventListener('mousedown', (e) => {
        if(e.target === modal){
            hideModal();
        }
    })
}

function getUpcomingProjects(projectName){

    let upcomingProject = getProjects(projectName);
    upcomingProject.resetList();

    let inbox = getProjects('Inbox');
    let projectsCopy;
    if(localStorage.getItem('projects') || inbox.tasks){
        projectsCopy = getProjects('all');
        projectsCopy.push(inbox);

        projectsCopy.forEach(project => {

            project.tasks.forEach(task => {
                if(projectName === 'Today'){
                    if(isToday(new Date(task.dueDate))){
                        let taskCopy = task;
                        taskCopy.projectName = task.project;
                        taskCopy.id = task.id;
                        upcomingProject.add(taskCopy);
                   }
                } else if (projectName === 'Upcoming'){
                    if(isThisWeek(new Date(task.dueDate))){
                        let taskCopy = task;
                        taskCopy.projectName = task.project;
                        taskCopy.id = task.id;
                        upcomingProject.add(taskCopy);
                   }
                }
              
            })
        });

        localStorage.setItem(projectName, JSON.stringify(upcomingProject));

        displayTasks(getProjects(projectName));

        toggleTaskForm('hide');
        toggleProjectForm('hide');
        toggleAddTaskButton();
        toggleSelectedProjectListeners();
    }

}
