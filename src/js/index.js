import '../style.css'
import {default as renderUI} from './renderUI';
import {default as addEventListeners} from './listeners';
import { initializeDefaultProjects } from './project';

/**
 * clean up/comment code
 * clean up/comment css
 * push project
 */

/**All functions required on page load*/
initializeDefaultProjects();
renderUI();
addEventListeners();
