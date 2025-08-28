import {elements} from './elements.js';
import {renderAll} from './render.js';
import {onDocumentKeyDown} from './events.js';
import {onAddDay, onCancelEditDay, onDeleteDay, onEditDay, onSaveEditDay, toggleSummary} from "./events_days";

// Attach listeners
// Main Buttons
elements.toggleSummaryBtn.addEventListener('click', toggleSummary);
// Day Buttons
elements.addDayBtn.addEventListener('click', onAddDay);
elements.editDayBtn.addEventListener('click', onEditDay);
elements.cancelEditDayBtn.addEventListener('click', onCancelEditDay);
elements.saveEditDayBtn.addEventListener('click', onSaveEditDay);
elements.deleteDayBtn.addEventListener('click', onDeleteDay);
//
document.addEventListener('keydown', onDocumentKeyDown);


// Initial render
renderAll();
