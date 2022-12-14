export default Project;
export { getProjects, updateProjects, removeProject, getProjectIndex, initializeDefaultProjects };
import { initializeMethods } from "./list";

/**
 * Constructor function that creates a project object
 * and initializes project item in localStorage if 
 * necessary.
 * 
 * @param {string} name - Name of project
 * @returns none
 */
function Project(name){
    //Initialize default attributes
    this.name = name;
    this.tasks = [];
    
    //Set a separate localStorage item for the default projects
    if(name === 'Inbox' || 
       name === 'Today' || 
       name === 'Upcoming'){

        localStorage.setItem(name, JSON.stringify(this));
        return;
    }
    
    //Append project to projects item if it already exists
    if(localStorage.getItem('projects')){
        let projectCopy = getProjects('all');

        projectCopy.push(this);
        localStorage.setItem('projects', JSON.stringify(projectCopy));
    
    //Create new projects item if one does not exist yet and add project to it
    } else if(!localStorage.getItem('projects')){
        let projects = [];
        projects.push(this);
        localStorage.setItem('projects', JSON.stringify(projects));
    }


}

/**
 * Takes a copy of a project and updates it in localStorage
 * 
 * @param {object} projectCopy - Copy of project
 */
function updateProjects(projectCopy){
    //If project is default project, update it directly
    if( projectCopy.name === 'Inbox' || 
        projectCopy.name === 'Today' || 
        projectCopy.name === 'Upcoming'){
            localStorage.setItem(projectCopy.name, JSON.stringify(projectCopy))

         } else {
            //Get copy of projects item
            let projects = JSON.parse(localStorage.getItem('projects'));
            //Get the index of the project
            let projectIndex = getProjectIndex(projectCopy.name);

            //Update projects copy using project index
            projects[projectIndex] = projectCopy;

            //Update local storage with new projects item
            localStorage.setItem('projects', JSON.stringify(projects));
         }
    
}

/**
 * Removes project from localStorage
 * 
 * @param {string} projectName - Name of project
 */
function removeProject(projectName){
    let projects = getProjects('all');

    //Filter out the project that is to be removed
    let newProjects = projects.filter(project => {
        return project.name !== projectName
    });

    //Update localStorage
    localStorage.setItem('projects', JSON.stringify(newProjects));
}

/**
 * Gets copy of project from localStorage, initializes methods to 
 * manipulate tasks[] property, and returns copy of project.
 * 
 * @param {string} projectName - Name of project
 * @returns copy of project
 */
function getProjects(projectName){
    let projectsCopy;

    //If project is a default project, get it from localStorage directly
    if(projectName === 'Inbox' || 
       projectName === 'Today' || 
       projectName === 'Upcoming'){ 
        projectsCopy = initializeMethods.call(JSON.parse(localStorage.getItem(projectName)));
        return projectsCopy;

    } 
    //If there are no user created projects present
    if(!localStorage.getItem('projects')){
        return [];
    }else if (projectName === 'all'){
        //Get copy projects from localStorage
        projectsCopy = JSON.parse(localStorage.getItem('projects'));

        //Initialize methods for each project
        projectsCopy.forEach(project => {
            project = initializeMethods.call(project);
        })

        //Return copy of projects
        return projectsCopy;

    } else {
        projectsCopy = JSON.parse(localStorage.getItem('projects'));
        //Get index using project name passed into function
        let projectIndex = getProjectIndex(projectName);

        //Return the project with the methods initialized
        return initializeMethods.call(projectsCopy[projectIndex]);

    }
    
}

/**
 * Get index of project in projects item inside of 
 * localStorage
 * 
 * @param {string} projectName - Name of project
 * @returns index of project
 */
function getProjectIndex(projectName){
    //Will be the default name used if no parameter is passed
    const currentProjectName = document.querySelector('.tasks').getAttribute('data-project-name');

    let projectsCopy = getProjects('all');
    
    //Finds the index of the project
    let projectIndex = projectsCopy.findIndex(project => {
        //If parameter was passed...
        if(projectName){
            return projectName === project.name;
        } else {
            //Default name is used if no parameter is passed
            return currentProjectName === project.name;        }
    });

    return projectIndex;
}

/**
 * Initializes default projects if this is the first time user
 * visits webpage
 * 
 * @returns none
 */
function initializeDefaultProjects(){
    //If this is the user's first time visiting webpage
    if(!localStorage.getItem('Inbox') ||
       !localStorage.getItem('Today') || 
       !localStorage.getItem('Upcoming')){

        localStorage.setItem('Inbox', JSON.stringify(new Project('Inbox')));
        localStorage.setItem('Today', JSON.stringify(new Project('Today')));
        localStorage.setItem('Upcoming', JSON.stringify(new Project('Upcoming')));

    } 
}




