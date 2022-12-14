export default task;

/**
 * Factory function that creates task
 * 
 * @param {string} title - Title/name of task
 * @param {string} description - Description of task
 * @param {string} dueDate - Due date of task
 * @param {string} priority - Priority of task
 * @param {string} project - Project task belongs to
 * @returns 
 */
function task(title = 'Untitled Task',
             description,
             dueDate,
             priority,
             project){

    return {title, description, dueDate, priority, project}
}


