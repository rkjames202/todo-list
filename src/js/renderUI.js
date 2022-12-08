export default renderUI;
export { displayTasks, toggleTaskForm, toggleAddTaskButton, toggleProjectForm, createProjectList };

import { addTaskRemoveListener, addProjectListeners, addEditTaskListener, addSaveEditTaskListener, addCancelEditTaskListener } from "./listeners";
import { Inbox, projects } from "./project";
import { format } from "date-fns";

function renderUI(){
    const body = document.querySelector('body');
    body.appendChild(createHeaderBar());
    
    const content = createContent();
    content.appendChild(createSidebar());
    content.appendChild(createTasksContainer());
    body.appendChild(content);

    displayTasks(Inbox);

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

/**
 * Create CSS rules for sidebar classes
 */
function createSidebar(){
    let topContent = ['Inbox', 'Today', 'Upcoming'];
    const sideBar = document.createElement('div');
    sideBar.classList.add('sidebar');

    const topList = document.createElement('ul');
    topList.classList.add('top-sidebar');
    for(let i = 0; i < 3; i++){
        topList.appendChild(document.createElement('li')).innerText = topContent[i];
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

    const projectsContainer = document.createElement('div');
    projectsContainer.classList.add('projects-container');

    let projectList = createProjectList();
    projectList.forEach((project) => {
        projectsContainer.appendChild(project);
    })

    bottomList.appendChild(projectsContainer);

    const addProjectButton = document.createElement('button');
    addProjectButton.classList.add('add-project-button');
    addProjectButton.innerText = 'Add Project';
    bottomList.appendChild(addProjectButton);

    const addProjectInterface = document.createElement('div');
    addProjectInterface.classList.add('add-project-interface');

    const projectNameInput = document.createElement('input');
    projectNameInput.setAttribute('id', 'project-name');
    projectNameInput.placeholder = 'Project name';
    projectNameInput.autocomplete = 'off';
    addProjectInterface.appendChild(projectNameInput);

    const submitButton = document.createElement('button');
    submitButton.classList.add('submit-project-button');
    submitButton.disabled = true;
    submitButton.innerText = 'Add Project';
    addProjectInterface.appendChild(submitButton);

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-project-button');
    cancelButton.innerText = 'Cancel';
    addProjectInterface.appendChild(cancelButton);

    bottomList.appendChild(addProjectInterface);

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
    taskForm.appendChild(taskName);
    
    const taskDescription = document.createElement('input');
    taskDescription.id = 'task-description';
    taskDescription.placeholder = 'Description';
    taskDescription.autocomplete = 'off';
    taskForm.appendChild(taskDescription);

    const taskDate = document.createElement('input');
    taskDate.id = 'task-date';
    taskDate.type = 'date';
    taskForm.appendChild(taskDate);

    const taskPriority = document.createElement('select');
    taskPriority.id = 'task-priority';

    for(let i = 1; i < 5; i++){
        const priorityOption = document.createElement('option');
        priorityOption.innerText = i;
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
    taskSubmitButton.innerText = 'Add Task';
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
    
    project.tasks.list.forEach((task, index) => {
        const currentTask = document.createElement('div');
        currentTask.classList.add('task-container');
        currentTask.setAttribute('data-task-id', index);

        //Project task belongs to
        if(project.name === 'Today' || project.name === 'Upcoming'){
            const projectName = document.createElement('p');
            projectName.innerText = task.projectName;

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
        const taskDescription = document.createElement('p');
        taskDescription.classList.add('task-description');
        taskDescription.innerText = task.description;
        taskInfo.appendChild(taskDescription);

        //Task due date, if statement to prevent default 12/31/1969 from showing
        if(task.dueDate){
            const taskDueDate = document.createElement('p');
            taskDueDate.classList.add('task-date');

            taskDueDate.innerText = format(task.dueDate, 'MM/dd/yyyy');
            taskInfo.appendChild(taskDueDate);
        }
        
        //Task priority, change color of 'circle' depending on priority
        const taskPriority = document.createElement('p');
        taskPriority.classList.add('task-priority');
        taskPriority.innerText = `Priority: ${task.priority}`;
        taskInfo.appendChild(taskPriority);

        currentTask.appendChild(taskInfo);

        const taskButtons = document.createElement('div');
        taskButtons.classList.add('task-buttons');
        
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-task-button');
        removeButton.innerText = 'Remove Task';
        taskButtons.appendChild(removeButton);

        const editButton = document.createElement('button');
        editButton.classList.add('edit-task-button');
        editButton.innerText = 'Edit Task';
        taskButtons.appendChild(editButton);

        currentTask.appendChild(taskButtons);

        currentTask.appendChild(createEditTaskInterface(task));

        tasksContainer.appendChild(currentTask);
    });

    addTaskRemoveListener();
    addEditTaskListener();
    addSaveEditTaskListener();
    addCancelEditTaskListener();
}

function createProjectList(option){
    let projectList = [];

    //Create project listing for each project
    projects.forEach((project) => {
        if(project.name === 'Inbox' ||
           project.name === 'Today' || 
           project.name === 'Upcoming'){
            return;
        };
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
        const projectsContainer = document.querySelector('.projects-container');
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
    
    const newDescription = document.createElement('input');
    newDescription.setAttribute('id', 'new-task-description');
    newDescription.placeholder = 'Description';
    newDescription.autocomplete = 'off';
    if(task.description) {newDescription.value = task.description};

    const newDate = document.createElement('input');
    newDate.setAttribute('id', 'new-task-date');
    newDate.type = 'date';
    if(task.dueDate) {newDate.value = format(task.dueDate, 'yyyy-MM-dd')};

    const newPriority = document.createElement('select');
    newPriority.setAttribute('id', 'new-task-priority');
    for(let i = 1; i < 5; i++){
        const option = document.createElement('option');
        option.innerText = i;
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