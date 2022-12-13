export default renderUI;
export { displayTasks, toggleTaskForm, toggleAddTaskButton, toggleProjectForm, createProjectList, showModal, hideModal};

import { addTaskRemoveListener, addProjectListeners, addEditTaskListener, addSaveEditTaskListener, addCancelEditTaskListener, addModalListeners } from "./listeners";
import { getProjects } from "./project";
import { format, parseJSON } from "date-fns";

function renderUI(){
    const body = document.querySelector('body');
    body.appendChild(createHeaderBar());
    
    const content = createContent();
    const mainContent = createMainContent();

    content.appendChild(createSidebar());
    content.appendChild(createModal());
    mainContent.appendChild(createTasksContainer());

    content.appendChild(mainContent);
    body.appendChild(content);

    displayTasks(getProjects('Inbox'));

}

function createHeaderBar(){
    const headerBar = document.createElement('div');
    headerBar.classList.add('header-bar');

    const headerTitle = document.createElement('p');
    headerTitle.innerText = 'To-Do-List';
    headerTitle.classList.add('header-title');

    headerBar.appendChild(headerTitle);

    return headerBar;
}

function createContent(){
    const content = document.createElement('div');
    content.setAttribute('id', 'content');

    return content;
}

function createMainContent(){
    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content');

    return mainContent;
}

function createSidebar(){
    let topContent = ['Inbox', 'Today', 'Upcoming'];
    const sideBar = document.createElement('div');
    sideBar.classList.add('sidebar');

    const topList = document.createElement('ul');
    topList.classList.add('top-sidebar');

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

    const bottomList = document.createElement('div');
    bottomList.classList.add('bottom-sidebar');

    const bottomHeader = document.createElement('div');
    bottomHeader.classList.add('bottom-sidebar-header');

    const bottomTitle = document.createElement('p');
    bottomTitle.classList.add('bottom-sidebar-title');
    bottomTitle.innerText = 'Projects';
    bottomHeader.appendChild(bottomTitle);

    bottomList.appendChild(bottomHeader);

    const addProjectButton = document.createElement('button');
    addProjectButton.classList.add('add-project-button');
    
    const addProjectButtonIcon= document.createElement('i');
    addProjectButtonIcon.classList.add('fa-solid', 'fa-plus');

    addProjectButton.appendChild(addProjectButtonIcon);

    bottomHeader.appendChild(addProjectButton);

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


    const projectsContainer = document.createElement('div');
    projectsContainer.classList.add('projects-container');

    let projectList = createProjectList();

    if(projectList){
        projectList.forEach((project) => {
            projectsContainer.appendChild(project);
        });
    }
   
    bottomList.appendChild(projectsContainer);

    sideBar.appendChild(bottomList);

    return sideBar;
}

function createTasksContainer(){
    //Includes tasks and add task interface
    const tasksDisplay = document.createElement('div');
    tasksDisplay.classList.add('tasks-display');

    const tasks = document.createElement('div');
    tasks.classList.add('tasks');

    tasksDisplay.appendChild(tasks);

    tasksDisplay.appendChild(createTaskInterface());

    return tasksDisplay;

}

function createTaskInterface(){
    const addTaskInterface = document.createElement('div');
    addTaskInterface.classList.add('add-task-interface');

    const taskForm = document.createElement('div');
    taskForm.classList.add('add-task-form');

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

    let priorityColors = ['\uD83D\uDD34', 
                         '\uD83D\uDFE1',
                         '\uD83D\uDD35',
                         '\u26AA'];
    for(let i = 1; i < 5; i++){
        const priorityOption = document.createElement('option');
        priorityOption.innerText = `${priorityColors[i-1]} Priority ${i}`
        priorityOption.value = i;

        if(i == 1){priorityOption.selected = true}

        taskPriority.appendChild(priorityOption);
    }

    taskForm.appendChild(taskPriority);

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

    const taskButton = document.createElement('button');
    taskButton.classList.add('add-task-button');
    taskButton.innerText = 'Add Task';

    addTaskInterface.appendChild(taskForm);
    addTaskInterface.appendChild(taskButton);

    return addTaskInterface;
}

/**
 * 
 * Add buttons to each task item to edit task 
 */
function displayTasks(project){
    
    const tasksContainer = document.querySelector('.tasks');
    tasksContainer.replaceChildren();
    //Use this when editing tasks in a list
    tasksContainer.setAttribute('data-project-name', project.name);

    //Display project name on top of list
    const projectTitle = document.createElement('p');
    projectTitle.innerText = project.name;
    tasksContainer.appendChild(projectTitle);

        project.tasks.forEach((task, index) => {
            const currentTask = document.createElement('div');
            currentTask.classList.add('task-container');
            currentTask.setAttribute('data-task-id', index);
            //Project task belongs to
            if(project.name === 'Today' || project.name === 'Upcoming'){
                const projectName = document.createElement('p');
                projectName.classList.add('upcoming-project-name');
                projectName.innerText = `From: ${task.projectName}`;

                currentTask.appendChild(projectName);
            }

            const taskInfo = document.createElement('div');
            taskInfo.classList.add('task-info');

            //Task title
            const taskTitle = document.createElement('p');
            taskTitle.classList.add('task-title');
            taskTitle.innerText = task.title;
            taskInfo.appendChild(taskTitle);

            //Task description
            if(task.description){
                const taskDescription = document.createElement('p');
                taskDescription.classList.add('task-description');
                taskDescription.innerText = task.description;
                taskInfo.appendChild(taskDescription);
            }      

            //Task due date, if statement to prevent default 12/31/1969 from showing
            if(task.dueDate){
                const taskDueDate = document.createElement('p');
                taskDueDate.classList.add('task-date');

                taskDueDate.innerText = format(parseJSON(task.dueDate), 'MMM do, yyyy');
                taskInfo.appendChild(taskDueDate);
            }
            
            currentTask.style['border-left'] = `5px solid var(--priority-${task.priority}-color)`;
            
            currentTask.appendChild(taskInfo);

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

    addTaskRemoveListener();
    addEditTaskListener();
    addSaveEditTaskListener();
    addCancelEditTaskListener();
    addModalListeners();
}

function createProjectList(option){
    const projectsContainer = document.querySelector('.projects-container');

    let projectList = [];
    let projectsCopy;
    
    if(localStorage.getItem('projects')){
        projectsCopy = getProjects('all');

    } else if (option === 'clear'){
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

function createEditTaskInterface(task){
    const editTaskContainer = document.createElement('div');
    editTaskContainer.classList.add('edit-task-container');

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

    if(task.dueDate) {
        newDate.value = format(parseJSON(task.dueDate), 'yyyy-MM-dd')
    };

    const newPriority = document.createElement('select');
    newPriority.setAttribute('id', 'new-task-priority');
    let priorityColors = ['\uD83D\uDD34', 
                         '\uD83D\uDFE1',
                         '\uD83D\uDD35',
                         '\u26AA'];
    for(let i = 1; i < 5; i++){
        const option = document.createElement('option');
        option.innerText = `${priorityColors[i-1]} Priority ${i}`;
        option.value = i;

        if(i == task.priority){option.selected = true}

        newPriority.appendChild(option);
    }

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

function toggleTaskForm(option){
    const taskButton = document.querySelector('.add-task-button');
    const taskForm = document.querySelector('.add-task-form');

    if(option === 'hide'){
        taskForm.style.display = 'none'; 
        taskButton.style.display = 'block';
    }else if (option === 'show'){
        taskForm.style.display = 'block';
        taskButton.style.display = 'none';
    }
}

function toggleProjectForm(option){
    const projectButton = document.querySelector('.add-project-button');
    const projectForm = document.querySelector('.add-project-interface');

    if(option === 'hide'){
        projectForm.style.display = 'none'; 
        projectButton.style.display = 'block';
    }else if (option === 'show'){
        projectForm.style.display = 'block';
        projectButton.style.display = 'none';
    }
}

function toggleAddTaskButton(){
    const addTaskButton = document.querySelector('.add-task-button');

    addTaskButton.style.display = 'none';
}

function createModal(){
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const modalHeader = document.createElement('div');
    modalHeader.classList.add('modal-header');

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.classList.add('close-button-container');
    modalHeader.appendChild(closeButtonContainer);

    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButtonContainer.appendChild(closeButton);

    const modalHeaderTitle = document.createElement('p');
    modalHeaderTitle.innerText = 'Task-Info';
    modalHeader.appendChild(modalHeaderTitle);

    const modalTaskInfo = document.createElement('div');
    modalTaskInfo.classList.add('modal-task-info');

    //Task project
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

function hideModal(){
    const modal = document.querySelector('.modal');

    modal.style.display = 'none'
}

function showModal(){
    const modal = document.querySelector('.modal');
    const project = document.querySelector('.modal-project');
    const title = document.querySelector('.modal-title');
    const description = document.querySelector('.modal-description');
    const date = document.querySelector('.modal-date');
    const priority = document.querySelector('.modal-priority');

    const projectName = document.querySelector('.tasks').getAttribute('data-project-name');
    const taskId = this.parentNode.parentNode.getAttribute('data-task-id');
   
    let task = getProjects(projectName).tasks[taskId];
    
    project.innerText = task.project;
    title.innerText = task.title;

    if(task.description){
        description.innerText = task.description;
    } else {
        description.innerText = 'N/A';
    }

    if(task.dueDate){
        date.innerText = format(parseJSON(task.dueDate), 'MMM do, yyyy');
    } else {
        date.innerText = 'N/A';
    }

    let priorityColors = ['\uD83D\uDD34', 
                         '\uD83D\uDFE1',
                         '\uD83D\uDD35',
                         '\u26AA'];
    
    priority.innerText = `${priorityColors[task.priority - 1]} ${task.priority}`;

    modal.style.display = 'flex';

}