const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const STUDENTS_PER_SECTION = 10;
const ROLL_FORMAT = /^([A-Z]{2})\.([A-Z]{2})\.U(\d)([A-Z]{3,4})(\d{2})(\d{3})$/;

export const STUDENT_ROLL_FORMAT = 'CB.SC.U4CSE23XXX';

export const parseStudentRollNumber = (input) => {
    if (!input) {
        return null;
    }

    const normalized = input.trim().toUpperCase();
    const match = normalized.match(ROLL_FORMAT);

    if (!match) {
        return null;
    }

    const [, campus, program, yearCode, branch, batchYear, uniqueCode] = match;
    const studentNumber = parseInt(uniqueCode, 10);

    if (Number.isNaN(studentNumber) || studentNumber < 1) {
        return null;
    }

    // Range-based section assignment:
    // 001-010 → A (index 0), 011-020 → B (index 1), 021-030 → C (index 2), etc.
    const sectionIndex = Math.floor((studentNumber - 1) / STUDENTS_PER_SECTION);

    if (sectionIndex < 0 || sectionIndex >= SECTION_LETTERS.length) {
        return null;
    }

    const sectionLetter = SECTION_LETTERS[sectionIndex];

    return {
        normalized,
        campus,
        program,
        yearCode,
        branch,
        batchYear,
        sectionIndex,
        sectionLetter,
        sectionName: `${branch} ${sectionLetter}`,
        studentNumber: uniqueCode,
    };
};
