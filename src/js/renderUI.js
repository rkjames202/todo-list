export default renderUI;
export { displayTasks, toggleTaskForm, toggleAddTaskButton, toggleProjectForm, toggleEditTaskContainers, createProjectList, showModal, hideModal};

import { addTaskRemoveListener, addProjectListeners, addEditTaskListener, addSaveEditTaskListener, addCancelEditTaskListener, addModalListeners } from "./listeners";
import { getProjects } from "./project";
import { format, parseJSON } from "date-fns";
import Icon from '../clipboard.png';
import task from "./task";

/**
 * Renders User Interface
 */
function renderUI(){
    renderTabIcon();

    const body = document.querySelector('body');
    body.appendChild(createHeaderBar());
    
    const content = createContent();
    const mainContent = createMainContent();

    content.appendChild(createSidebar());
    content.appendChild(createModal());

    mainContent.appendChild(createTasksContainer());

    content.appendChild(mainContent);
    body.appendChild(content);

    //Display Inbox on page load
    displayTasks(getProjects('Inbox'));

}

/**
 * Renders tab icon
 */
function renderTabIcon(){
    const head = document.querySelector('head');
    const icon = document.createElement('link');

    icon.rel = 'icon';
    //Use file path from Icon module
    icon.href = Icon;

    head.appendChild(icon);
}

/**
 * Creates header bar
 * 
 * @returns header div
 */
function createHeaderBar(){
    const headerBar = document.createElement('div');
    headerBar.classList.add('header-bar');

    const headerTitle = document.createElement('p');
    headerTitle.innerText = 'To-Do-List';
    headerTitle.classList.add('header-title');

    headerBar.appendChild(headerTitle);

    return headerBar;
}

/**
 * Creates content container
 * 
 * @returns content div
 */
function createContent(){
    const content = document.createElement('div');
    content.setAttribute('id', 'content');

    return content;
}

/**
 * Creates div for main content
 * 
 * @returns mainContent div
 */
function createMainContent(){
    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content');

    return mainContent;
}

/**
 * Creates sidebar for project listings
 * 
 * @returns sidebar containing all projects
 */
function createSidebar(){
    //Default projects
    let topContent = ['Inbox', 'Today', 'Upcoming'];

    const sideBar = document.createElement('div');
    sideBar.classList.add('sidebar');

    const topList = document.createElement('ul');
    topList.classList.add('top-sidebar');

    //Adds each default project to the top of the list
    for(let i = 0; i < 3; i++){
        const listItem = document.createElement('li');
        listItem.innerText = topContent[i];

        //Inbox is selected by default on page load
        if(i === 0){
            listItem.classList.add('selected-project');
        }

        topList.appendChild(listItem);
    }

    sideBar.appendChild(topList);

    //Bottom list components
    const bottomList = document.createElement('div');
    bottomList.classList.add('bottom-sidebar');

    const bottomHeader = document.createElement('div');
    bottomHeader.classList.add('bottom-sidebar-header');

    const bottomTitle = document.createElement('p');
    bottomTitle.classList.add('bottom-sidebar-title');
    bottomTitle.innerText = 'Projects';
    bottomHeader.appendChild(bottomTitle);

    bottomList.appendChild(bottomHeader);

    //Project button components
    const addProjectButton = document.createElement('button');
    addProjectButton.classList.add('add-project-button');
    
    const addProjectButtonIcon= document.createElement('i');
    addProjectButtonIcon.classList.add('fa-solid', 'fa-plus');

    addProjectButton.appendChild(addProjectButtonIcon);

    bottomHeader.appendChild(addProjectButton);

    //Project interface components
    const addProjectInterface = document.createElement('div');
    addProjectInterface.classList.add('add-project-interface');

    const projectNameInput = document.createElement('input');
    projectNameInput.setAttribute('id', 'project-name');
    projectNameInput.placeholder = 'Project name';
    projectNameInput.autocomplete = 'off';
    projectNameInput.maxLength = 15;
    addProjectInterface.appendChild(projectNameInput);

    const projectFormButtons = document.createElement('div');
    projectFormButtons.classList.add('project-form-buttons');

    const submitButton = document.createElement('button');
    submitButton.classList.add('submit-project-button');
    submitButton.disabled = true;
    submitButton.innerText = 'Add';
    projectFormButtons.appendChild(submitButton);

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-project-button');
    cancelButton.innerText = 'Cancel';
    projectFormButtons.appendChild(cancelButton);

    addProjectInterface.appendChild(projectFormButtons);
    
    const errorMessage = document.createElement('p');
    errorMessage.classList.add('error-message');
    errorMessage.innerText = '*Project names must be unique.';
    addProjectInterface.appendChild(errorMessage);

    bottomList.appendChild(addProjectInterface);

    //Container for project listing
    const projectsContainer = document.createElement('div');
    projectsContainer.classList.add('projects-container');

    let projectList = createProjectList();

    //Add project listings to container
    if(projectList){
        projectList.forEach((project) => {
            projectsContainer.appendChild(project);
        });
    }
   
    bottomList.appendChild(projectsContainer);

    sideBar.appendChild(bottomList);

    return sideBar;
}

/**
 * Creates a container for all task related elements
 * to go in
 * 
 * @returns div that will display tasks
 */
function createTasksContainer(){

    //Includes tasks and add task interface
    const tasksDisplay = document.createElement('div');
    tasksDisplay.classList.add('tasks-display');

    const tasks = document.createElement('div');
    tasks.classList.add('tasks');

    tasksDisplay.appendChild(tasks);

    //Adds add task interface to task display
    tasksDisplay.appendChild(createTaskInterface());

    return tasksDisplay;

}

/**
 * Creates a form for user to add new tasks
 * 
 * @returns add task interface
 */
function createTaskInterface(){
    const addTaskInterface = document.createElement('div');
    addTaskInterface.classList.add('add-task-interface');

    const taskForm = document.createElement('div');
    taskForm.classList.add('add-task-form');

    //Task form elements
    const taskName = document.createElement('input');
    taskName.id = 'task-name';
    taskName.placeholder = 'Task name';
    taskName.autocomplete = 'off';
    taskName.maxLength = 30;
    taskForm.appendChild(taskName);
    
    const taskDescription = document.createElement('textarea');
    taskDescription.rows = 4;
    taskDescription.id = 'task-description';
    taskDescription.placeholder = 'Description';
    taskForm.appendChild(taskDescription);

    const taskDate = document.createElement('input');
    taskDate.id = 'task-date';
    taskDate.type = 'date';
    taskForm.appendChild(taskDate);

    const taskPriority = document.createElement('select');
    taskPriority.id = 'task-priority';

    //Array containing colored circles in unicode for each priority
    let priorityColors = ['\uD83D\uDD34', 
                         '\uD83D\uDFE1',
                         '\uD83D\uDD35',
                         '\u26AA'];
    

    //Creates options for <select> element and adds colored circles to them
    for(let i = 1; i < 5; i++){
        const priorityOption = document.createElement('option');
        priorityOption.innerText = `${priorityColors[i-1]} Priority ${i}`
        priorityOption.value = i;

        //Priority 1 selected by default
        if(i == 1){priorityOption.selected = true}

        taskPriority.appendChild(priorityOption);
    }

    taskForm.appendChild(taskPriority);

    //Buttons for add task form
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('task-button-container');

    const taskSubmitButton = document.createElement('button');
    taskSubmitButton.classList.add('task-submit-button');
    taskSubmitButton.disabled = true;
    taskSubmitButton.innerText = 'Add';
    buttonContainer.appendChild(taskSubmitButton);

    const taskCancelButton = document.createElement('button');
    taskCancelButton.classList.add('task-cancel-button');
    taskCancelButton.innerText = 'Cancel';
    buttonContainer.appendChild(taskCancelButton);

    taskForm.appendChild(buttonContainer);
    
    //Button to display add-task-form
    const taskButton = document.createElement('button');
    taskButton.classList.add('add-task-button');
    taskButton.innerText = 'Add Task';

    addTaskInterface.appendChild(taskForm);
    addTaskInterface.appendChild(taskButton);

    return addTaskInterface;
}

/**
 * Displays the tasks of any given object
 * 
 * @param {object} project - Project that will have their tasks displayed
 */
function displayTasks(project){
    
    const tasksContainer = document.querySelector('.tasks');
    //Clear container
    tasksContainer.replaceChildren();
    //Store this project's name 
    tasksContainer.setAttribute('data-project-name', project.name);

    //Display project name 
    const projectTitle = document.createElement('p');
    projectTitle.innerText = project.name;
    tasksContainer.appendChild(projectTitle);

        //Display each task inside of project
        project.tasks.forEach((task, index) => {

            const currentTask = document.createElement('div');
            currentTask.classList.add('task-container');
            currentTask.setAttribute('data-task-id', index);

            /**
             * If viewing one of the two 'Upcoming' projects, the original
             * project of the task is displayed
            */
            if(project.name === 'Today' || project.name === 'Upcoming'){
                const projectName = document.createElement('p');
                projectName.classList.add('upcoming-project-name');
                projectName.innerText = `From: ${task.projectName}`;

                currentTask.appendChild(projectName);
            }

            //All task information
            const taskInfo = document.createElement('div');
            taskInfo.classList.add('task-info');

            //Task title
            const taskTitle = document.createElement('p');
            taskTitle.classList.add('task-title');
            taskTitle.innerText = task.title;
            taskInfo.appendChild(taskTitle);

            //If statements for description and date since they are optional 

            //Task description
            if(task.description){
                const taskDescription = document.createElement('p');
                taskDescription.classList.add('task-description');
                taskDescription.innerText = task.description;
                taskInfo.appendChild(taskDescription);
            }      

            //Task due date, if statement to prevent default '12/31/1969' from showing
            if(task.dueDate){
                const taskDueDate = document.createElement('p');
                taskDueDate.classList.add('task-date');

                taskDueDate.innerText = format(parseJSON(task.dueDate), 'MMM do, yyyy');
                taskInfo.appendChild(taskDueDate);
            }
            
            //Set appropriate border color depending on priority
            currentTask.style['border-left'] = `5px solid var(--priority-${task.priority}-color)`;
            
            currentTask.appendChild(taskInfo);

            //Task Buttons
            const taskButtons = document.createElement('div');
            taskButtons.classList.add('task-buttons');
            
            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-task-button');

            const removeButtonIcon = document.createElement('i');
            removeButtonIcon.classList.add('fa-regular', 'fa-trash-can');
            removeButton.appendChild(removeButtonIcon);

            taskButtons.appendChild(removeButton);

            const editButton = document.createElement('button');
            editButton.classList.add('edit-task-button');

            const editButtonIcon = document.createElement('i');
            editButtonIcon.classList.add('fa-regular', 'fa-pen-to-square');
            editButton.appendChild(editButtonIcon);

            taskButtons.appendChild(editButton);

            const infoButton = document.createElement('button');
            infoButton.classList.add('task-info-button');
            infoButton.innerText = '\uf129'

            taskButtons.appendChild(infoButton);

            currentTask.appendChild(taskButtons);
            currentTask.appendChild(createEditTaskInterface(task));
            tasksContainer.appendChild(currentTask);

        });
    
    //Add listeners for task container components
    addTaskRemoveListener();
    addEditTaskListener();
    addSaveEditTaskListener();
    addCancelEditTaskListener();
    addModalListeners();
}

/**
 * Creates a list of user created project listings
 * 
 * @param {string} option - Either 'reset' or 'clear' list 
 * @returns 
 */
function createProjectList(option){
    const projectsContainer = document.querySelector('.projects-container');

    let projectList = [];
    let projectsCopy;
    
    if(localStorage.getItem('projects')){
        //Get all user created projects
        projectsCopy = getProjects('all');

    } else if (option === 'clear'){
        //Clear container
        projectsContainer.replaceChildren();
        return;

    } else if(!localStorage.getItem('projects')){
        return;
    }

    //Create project listing for each project
    projectsCopy.forEach((project) => {
        const projectListing = document.createElement('div');
        projectListing.classList.add('project-listing');
        
        const projectTitle = document.createElement('p');
        projectTitle.innerText = project.name;
        projectListing.appendChild(projectTitle);

        const removeButton = document.createElement('button');
        removeButton.innerText = 'X';
        projectListing.appendChild(removeButton);

        projectList.push(projectListing);
    });

    //Used if any new projects are added
    if(option === 'reset'){
        projectsContainer.replaceChildren();

        projectList.forEach((project) => {
            projectsContainer.appendChild(project);
        });

        addProjectListeners();

    } else {
        return projectList;
    }

    
}

/**
 * Creates an edit interface for a task.
 * 
 * @param {object} task - Task object
 * @returns - Edit task container for task
 */
function createEditTaskInterface(task){
    const editTaskContainer = document.createElement('div');
    editTaskContainer.classList.add('edit-task-container');

    //Form elements
    const newName = document.createElement('input');
    newName.setAttribute('id', 'new-task-name');
    newName.placeholder = 'Task name';
    newName.autocomplete = 'off';
    newName.value = task.title;
    
    const newDescription = document.createElement('textarea');
    newDescription.setAttribute('id', 'new-task-description');
    newDescription.placeholder = 'Description';
    newDescription.rows = 4;
    if(task.description) {newDescription.value = task.description};

    const newDate = document.createElement('input');
    newDate.setAttribute('id', 'new-task-date');
    newDate.type = 'date';

    //If task has a due date, display it as a value
    if(task.dueDate) {
        newDate.value = format(parseJSON(task.dueDate), 'yyyy-MM-dd')
    };

    const newPriority = document.createElement('select');
    newPriority.setAttribute('id', 'new-task-priority');

    let priorityColors = ['\uD83D\uDD34', 
                         '\uD83D\uDFE1',
                         '\uD83D\uDD35',
                         '\u26AA'];
    
    //Adds colored circles to select options
    for(let i = 1; i < 5; i++){
        const option = document.createElement('option');
        option.innerText = `${priorityColors[i-1]} Priority ${i}`;
        option.value = i;

        //Selects the current priority of task
        if(i == task.priority){option.selected = true}

        newPriority.appendChild(option);
    }

    //Edit task buttons
    const editTaskButtons = document.createElement('div');
    editTaskButtons.classList.add('edit-task-buttons');

    const saveButton = document.createElement('button');
    saveButton.classList.add('save-edit-button');
    saveButton.innerText = 'Save';
    editTaskButtons.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-edit-button');
    cancelButton.innerText = 'Cancel';
    editTaskButtons.appendChild(cancelButton);

    editTaskContainer.appendChild(newName);
    editTaskContainer.appendChild(newDescription);
    editTaskContainer.appendChild(newDate);
    editTaskContainer.appendChild(newPriority);
    editTaskContainer.appendChild(editTaskButtons);

    return editTaskContainer;
}

/**
 * Shows or hides a task form and add task button
 * 
 * @param {string} option - To either 'show' or 'hide' form 
 */
function toggleTaskForm(option){
    const taskButton = document.querySelector('.add-task-button');
    const taskForm = document.querySelector('.add-task-form');

    const taskName = document.querySelector('#task-name');
    const taskDescription = document.querySelector('#task-description');
    const taskDate = document.querySelector('#task-date');
    const taskPriority = document.querySelector('#task-priority');
    const selectedPriority = taskPriority.querySelector('option[value="1"]');

    if(option === 'hide'){
        taskName.value = '';
        taskDescription.value = '';
        taskDate.value = '';
        selectedPriority.selected = true;

        taskForm.style.display = 'none'; 
        taskButton.style.display = 'block';

    }else if (option === 'show'){
        taskForm.style.display = 'block';
        taskButton.style.display = 'none';
    }
}

/**
 * Shows or hides project form and add project button
 * 
 * @param {string} option - To either 'show' or 'hide' form
 */
function toggleProjectForm(option){
    const projectButton = document.querySelector('.add-project-button');
    const projectForm = document.querySelector('.add-project-interface');

    const projectName = document.querySelector('#project-name');

    if(option === 'hide'){
        projectName.value = '';

        projectForm.style.display = 'none'; 
        projectButton.style.display = 'block';
    }else if (option === 'show'){
        projectForm.style.display = 'block';
        projectButton.style.display = 'none';
    }
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
            
            const thisTaskContainer = document.querySelector(`.task-container[data-task-id="${thisTaskId}"]`);
            const thisTaskInfo = thisTaskContainer.querySelector(`.task-info`);
            const thisTaskButtons = thisTaskContainer.querySelector(`.task-buttons`);

            //Show the task info and buttons
            thisTaskInfo.style.display = 'flex';
            thisTaskButtons.style.display = 'block';

            //Hide the edit container
            container.style.display = 'none';

        } else {
            let thisTaskId = container.parentNode.getAttribute('data-task-id');

            //Get the task info and buttons using the task id
            const thisTaskContainer = document.querySelector(`.task-container[data-task-id="${thisTaskId}"]`);
            const thisEditTaskContainer = thisTaskContainer.querySelector('.edit-task-container');

            const projectName = document.querySelector('.tasks').getAttribute('data-project-name');
            let projectCopy = getProjects(projectName);
            let taskCopy = projectCopy.tasks[thisTaskId];

            //Edit form values
            const taskName = thisEditTaskContainer.querySelector('#new-task-name');
            const taskDescription = thisEditTaskContainer.querySelector('#new-task-description');
            const taskPriority = thisEditTaskContainer.querySelector('#new-task-priority');
            
            taskName.value = taskCopy.title;
            taskDescription.value = taskCopy.description;
            if(taskCopy.date){
                const taskDate = thisEditTaskContainer.querySelector('#new-task-date');
                taskDate.value = format(new Date(taskCopy.dueDate), 'yyyy-MM-dd');
            }
            
            const priorityOption = taskPriority.querySelector(`option[value="${taskCopy.priority}"`);

            priorityOption.selected = true;

            //If the container matches the one in the parameter, show it
            container.style.display = 'block';
        }
    })
}


/**
 * Shows or hides add task button
 * 
 * @param {string} option To either 'show' or 'hide' button
 */
function toggleAddTaskButton(option){
    const addTaskButton = document.querySelector('.add-task-button');

    if(option === 'show'){
        addTaskButton.style.display = 'block';
    } else if (option === 'hide'){
        addTaskButton.style.display = 'none';
    }
}

/**
 * Creates modal
 * 
 * @returns modal
 */
function createModal(){
    const modal = document.createElement('div');
    modal.classList.add('modal');

    //Content container inside of modal
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    //All components inside of content container 

    //Header
    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');

    //Close button
    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.classList.add('close-button-container');
    modalHeader.appendChild(closeButtonContainer);

    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButtonContainer.appendChild(closeButton);

    //Header title
    const modalHeaderTitle = document.createElement('p');
    modalHeaderTitle.innerText = 'Task-Info';
    modalHeader.appendChild(modalHeaderTitle);

    //Task information
    const modalTaskInfo = document.createElement('div');
    modalTaskInfo.classList.add('modal-task-info');

    //Project task belongs to
    const taskProjectContainer = document.createElement('div');
    taskProjectContainer.classList.add('modal-project-container');

    const pLabelContainer = document.createElement('div');
    pLabelContainer.classList.add('modal-label-container');

    const projectLabel = document.createElement('p');
    projectLabel.innerText = 'Project:';
    
    pLabelContainer.appendChild(projectLabel);
    taskProjectContainer.appendChild(pLabelContainer);

    const projectText = document.createElement('p');
    projectText.classList.add('modal-project');
    taskProjectContainer.appendChild(projectText);

    //Task title
    const taskTitleContainer = document.createElement('div');
    taskTitleContainer.classList.add('modal-title-container');

    const tLabelContainer = document.createElement('div');
    tLabelContainer.classList.add('modal-label-container');

    const titleLabel = document.createElement('p');
    titleLabel.innerText = 'Title:';
    
    tLabelContainer.appendChild(titleLabel);
    taskTitleContainer.appendChild(tLabelContainer);

    const titleText = document.createElement('p');
    titleText.classList.add('modal-title');
    taskTitleContainer.appendChild(titleText);

    //Task Description
    const taskDescriptionContainer = document.createElement('div');
    taskDescriptionContainer.classList.add('modal-description-container');

    const dLabelContainer = document.createElement('div');
    dLabelContainer.classList.add('modal-label-container');

    const descriptionLabel = document.createElement('p');
    descriptionLabel.innerText = 'Description:';
    
    dLabelContainer.appendChild(descriptionLabel);
    taskDescriptionContainer.appendChild(dLabelContainer);

    const descTextContainer = document.createElement('div');
    descTextContainer.classList.add('modal-desc-text-container');
    
    const descriptionText = document.createElement('p');
    descriptionText.classList.add('modal-description');
    
    descTextContainer.appendChild(descriptionText);
    taskDescriptionContainer.appendChild(descTextContainer);

    //Task due date
    const taskDateContainer = document.createElement('div');
    taskDateContainer.classList.add('modal-date-container');

    const ddLabelContainer = document.createElement('div');
    ddLabelContainer.classList.add('modal-label-container');

    const dateLabel = document.createElement('p');
    dateLabel.innerText = 'Due-Date:';
    
    ddLabelContainer.appendChild(dateLabel);
    taskDateContainer.appendChild(ddLabelContainer);

    const dateText = document.createElement('p');
    dateText.classList.add('modal-date');
    taskDateContainer.appendChild(dateText);

    //Task priority
    const taskPriorityContainer = document.createElement('div');
    taskPriorityContainer.classList.add('modal-priority-container');

    const priLabelContainer = document.createElement('div');
    priLabelContainer.classList.add('modal-label-container');

    const priorityLabel = document.createElement('p');
    priorityLabel.innerText = 'Priority:'
    priLabelContainer.appendChild(priorityLabel);
    taskPriorityContainer.appendChild(priLabelContainer);

    const priorityText = document.createElement('p');
    priorityText.classList.add('modal-priority');
    taskPriorityContainer.appendChild(priorityText);

    modalTaskInfo.appendChild(taskProjectContainer);
    modalTaskInfo.appendChild(taskTitleContainer);
    modalTaskInfo.appendChild(taskDescriptionContainer);
    modalTaskInfo.appendChild(taskDateContainer);
    modalTaskInfo.appendChild(taskPriorityContainer);

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalTaskInfo);

    modal.appendChild(modalContent);

    return modal;
}

/**
 * Hides modal
 */
function hideModal(){
    const modal = document.querySelector('.modal');

    modal.style.display = 'none'
}

/**
 * Shows modal with appropriate task information
 */
function showModal(){
    const modal = document.querySelector('.modal');
    //All task information
    const project = document.querySelector('.modal-project');
    const title = document.querySelector('.modal-title');
    const description = document.querySelector('.modal-description');
    const date = document.querySelector('.modal-date');
    const priority = document.querySelector('.modal-priority');
    
    //Project name and ID
    const projectName = document.querySelector('.tasks').getAttribute('data-project-name');
    const taskId = this.parentNode.parentNode.getAttribute('data-task-id');

    //Get task
    let task = getProjects(projectName).tasks[taskId];
    
    //Set project and title
    project.innerText = task.project;
    title.innerText = task.title;

    //Set the description if there is one
    if(task.description){
        description.innerText = task.description;
    } else {
        description.innerText = 'N/A';
    }

    //Set the date if there is one
    if(task.dueDate){
        date.innerText = format(parseJSON(task.dueDate), 'MMM do, yyyy');
    } else {
        date.innerText = 'N/A';
    }

    //Colored circles for corresponding priority 
    let priorityColors = ['\uD83D\uDD34', 
                         '\uD83D\uDFE1',
                         '\uD83D\uDD35',
                         '\u26AA'];
    
    //Set priority
    priority.innerText = `${priorityColors[task.priority - 1]} ${task.priority}`;

    //Display modal
    modal.style.display = 'flex';

}