
import Project, { Inbox, Today, Upcoming } from "./project";
import task from "./task";
import { displayTasks, toggleTaskForm, toggleAddTaskButton, toggleProjectForm, createProjectList } from "./renderUI";
import { projects } from "./project";
import { isToday, isThisWeek } from 'date-fns'

export default addEventListeners;
export { addTaskRemoveListener, addProjectListeners, addEditTaskListener, addSaveEditTaskListener, addCancelEditTaskListener };

function addEventListeners(){
    addSidebarListeners();
    addTaskListeners();
    addProjectListeners();
    enableSubmitButtonListeners();
}

function addSidebarListeners(){
    const inbox = document.querySelector('.top-sidebar > li:nth-child(1)');
    

    inbox.onclick = () => {
        displayTasks(Inbox);
        toggleTaskForm('hide');
        toggleProjectForm('hide');
        
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
      
        let newTask = task(taskName.value, 
                           taskDescription.value, 
                           taskDate.valueAsDate, 
                           taskPriority.value, 
                           projectName);

        let currentProject = getProjectIndex();

        projects[currentProject].tasks.add(newTask);

        displayTasks(projects[currentProject]);

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
            const taskContainer = button.parentNode;
            const projectIndex = getProjectIndex();
            
            let taskID = taskContainer.getAttribute('data-task-id');
    
            projects[projectIndex].tasks.delete(taskID);
            
            displayTasks(projects[projectIndex]);

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

            thisTaskInfo.style.display = 'block';
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
            const currentProject = getProjectIndex();
            const taskId = button.parentNode.parentNode.parentNode.getAttribute('data-task-id');
            
            const newName = document.querySelector('#new-task-name').value;
            const newDescription = document.querySelector('#new-task-description').value;
            const newDate = document.querySelector('#new-task-date').valueAsDate;
            const newPriority = document.querySelector('#new-task-priority').value;

            console.log(projects[currentProject].tasks.list[taskId]);

            projects[currentProject].tasks.list[taskId].title = newName;
            projects[currentProject].tasks.list[taskId].description = newDescription;
            projects[currentProject].tasks.list[taskId].dueDate = newDate;
            projects[currentProject].tasks.list[taskId].priority = newPriority;
            
            displayTasks(projects[currentProject]);
        }
        
    })
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
        toggleProjectForm('show');
        toggleTaskForm('hide');
        toggleEditTaskContainers();

    }

    cancelButton.onclick = () => {
        toggleProjectForm('hide');
    }


}

function addProjectSubmitListener(){
    const submitButton = document.querySelector('.submit-project-button');

    submitButton.onclick = () => {
        const projectName = document.querySelector('#project-name');
        
        //Display error message
        if(projectName.value){
            let newProject = new Project(projectName.value);
            projectName.value = '';
            displayTasks(newProject);
            toggleProjectForm('hide');
            createProjectList('reset');
            submitButton.disabled = 'true';
        }
    }
}

function addRemoveProjectListeners(){
    const removeButtons = document.querySelectorAll('.project-listing > button');
    const projectList = document.querySelectorAll('.projects-container > .project-listing');

   for (let i = 0; i < removeButtons.length; i++) {
        const button = removeButtons[i];
        let projectName = projectList[i].childNodes[0].innerText;
        let projectIndex = getProjectIndex(projectName);

        button.onclick = (e) => {

            //Prevent addProjectItemListeners from bubbling
            e.stopPropagation();
            projects.splice(projectIndex, 1);
            createProjectList('reset');
            displayTasks(Inbox);
        }
    
   }
}

function addProjectItemListeners(){
    
    const projectList = document.querySelectorAll('.projects-container > .project-listing');

    projectList.forEach((projectItem) => {

        //Get paragraph node
        let projectName = projectItem.childNodes[0].innerText;
        let projectIndex = getProjectIndex(projectName);
 
         projectItem.onclick = () => {
            displayTasks(projects[projectIndex]);
            toggleTaskForm('hide');
            toggleProjectForm('hide');
            toggleEditTaskContainers();
         }
     });
 
}

function enableSubmitButtonListeners(){
    const taskName = document.querySelector('#task-name');
    const projectName = document.querySelector('#project-name');

    const taskSubmit = document.querySelector('.task-submit-button');
    const projectSubmit = document.querySelector('.submit-project-button');

    taskName.oninput = () => {
        if(taskName.value){
            taskSubmit.disabled = false; 
        }else {
            taskSubmit.disabled = true;  
        }
    }

    projectName.oninput = () => {
        if(projectName.value){
            projectSubmit.disabled = false;
        } else {
            projectSubmit.disabled = true; 
        }
    }
}

function addUpcomingListeners(){
    const todayListing = document.querySelector('.top-sidebar > li:nth-child(2)');

    todayListing.onclick = () => {
        Today.tasks.resetList();

        projects.forEach((project) => {
            if(project.name === 'Today' || project.name === 'Upcoming'){
                return;
            }
            project.tasks.list.forEach((task) => {
               if(isToday(new Date(task.dueDate))){
                    let taskCopy = task;
                    taskCopy.projectName = task.project;
                    Today.tasks.add(taskCopy);
               }
            })
        });

        displayTasks(Today);
        toggleTaskForm('hide');
        toggleProjectForm('hide');
        toggleAddTaskButton();
    }

    const upcomingListing = document.querySelector('.top-sidebar > li:nth-child(3)');

    upcomingListing.onclick = () => {
        Upcoming.tasks.resetList();

        projects.forEach((project) => {
            if(project.name === 'Upcoming' || project.name === 'Today'){
                return;
            }
            project.tasks.list.forEach((task) => {
               if(isThisWeek(new Date(task.dueDate))){
                    let taskCopy = task;
                    taskCopy.projectName = task.project;
                    Upcoming.tasks.add(taskCopy);
               }
            })
        });

        displayTasks(Upcoming);
        toggleTaskForm('hide');
        toggleProjectForm('hide');
        toggleAddTaskButton();
    }
    
   
}

function getProjectIndex(projectName){
    //Will be the default name used if no parameter is passed
    const currentProjectName = document.querySelector('.tasks').getAttribute('data-project-name');
    
    let projectIndex = projects.findIndex((project) => {
        if(projectName){
            return projectName === project.name;
        } else {
            return currentProjectName === project.name;        }
    });

    return projectIndex;
}

