import {elements} from './elements.js';
import {renderAll} from './render.js';
import {
    onAddDay,
    onCancelEditDay,
    onDeleteDay,
    onDocumentKeyDown,
    onEditDay,
    onNew,
    onQuickEntry,
    onSaveEditDay,
    onStop,
    toggleSummary
} from './events.js';

// Attach listeners
// Main Buttons
elements.newBtn.addEventListener('click', onNew);
elements.stopBtn.addEventListener('click', onStop);
elements.toggleSummaryBtn.addEventListener('click', toggleSummary);
// Day Buttons
elements.addDayBtn.addEventListener('click', onAddDay);
elements.editDayBtn.addEventListener('click', onEditDay);
elements.cancelEditDayBtn.addEventListener('click', onCancelEditDay);
elements.saveEditDayBtn.addEventListener('click', onSaveEditDay);
elements.deleteDayBtn.addEventListener('click', onDeleteDay);
// Quick Entry
elements.quickEntryBtn.addEventListener('click', onQuickEntry);
elements.quickEntryInput.addEventListener('keydown', onQuickEntry);
document.addEventListener('keydown', onDocumentKeyDown);


// Initial render
renderAll();
