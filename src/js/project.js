export default Project;
export { getProjects, updateProjects, removeProject, getProjectIndex, initializeDefaultProjects };
import { initializeMethods } from "./list";

function Project(name){

    this.name = name;
    this.tasks = [];
    

    if(name === 'Inbox' || 
       name === 'Today' || 
       name === 'Upcoming'){

        localStorage.setItem(name, JSON.stringify(this));
        return;
    }
    
    if(localStorage.getItem('projects')){
        let projectCopy = getProjects('all');

        projectCopy.push(this);
        localStorage.setItem('projects', JSON.stringify(projectCopy));
    
    } else if(!localStorage.getItem('projects')){
        let projects = [];
        projects.push(this);
        localStorage.setItem('projects', JSON.stringify(projects));
    }


}

function updateProjects(projectCopy){
    if( projectCopy.name === 'Inbox' || 
        projectCopy.name === 'Today' || 
        projectCopy.name === 'Upcoming'){
            localStorage.setItem(projectCopy.name, JSON.stringify(projectCopy))

         } else {
            let projects = JSON.parse(localStorage.getItem('projects'));
            let projectIndex = getProjectIndex(projectCopy.name);

            projects[projectIndex] = projectCopy;

            localStorage.setItem('projects', JSON.stringify(projects));
         }
    
}

function removeProject(projectName){
    let projects = getProjects('all');

    console.log(projectName);

    let newProjects = projects.filter(project => {
        return project.name !== projectName
    });

    localStorage.setItem('projects', JSON.stringify(newProjects));
}

function getProjects(projectName){
    let projectsCopy;

    if(projectName === 'Inbox' || 
       projectName === 'Today' || 
       projectName === 'Upcoming'){ 
        projectsCopy = initializeMethods.call(JSON.parse(localStorage.getItem(projectName)));
        return projectsCopy;

    } 
    if(!localStorage.getItem('projects')){
        return [];
    }else if (projectName === 'all'){
        projectsCopy = JSON.parse(localStorage.getItem('projects'));
        projectsCopy.forEach(project => {
            project = initializeMethods.call(project);
        })

        return projectsCopy;
    } else {
        
        projectsCopy = JSON.parse(localStorage.getItem('projects'));
        let projectIndex = getProjectIndex(projectName);

        return initializeMethods.call(projectsCopy[projectIndex]);

    }
    
}

function getProjectIndex(projectName){
    const currentProjectName = document.querySelector('.tasks').getAttribute('data-project-name');

    let projectsCopy = getProjects('all');
    //Will be the default name used if no parameter is passed
  
    
    let projectIndex = projectsCopy.findIndex(project => {
        if(projectName){
            return projectName === project.name;
        } else {
            return currentProjectName === project.name;        }
    });

    return projectIndex;
}

//Check for initial page load
function initializeDefaultProjects(){
    
    if(localStorage.getItem('visited') === false){
        
        localStorage.setItem('Inbox', JSON.stringify(new Project('Inbox')));
        localStorage.setItem('Today', JSON.stringify(new Project('Today')));
        localStorage.setItem('Upcoming', JSON.stringify(new Project('Upcoming')));

        return;

    } 

    localStorage.setItem('visited', 0);

}




