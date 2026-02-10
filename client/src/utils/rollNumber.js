const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
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
    const sectionIndex = parseInt(uniqueCode[0], 10);

    if (Number.isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= SECTION_LETTERS.length) {
        return null;
    }

    const sectionLetter = SECTION_LETTERS[sectionIndex];
    const studentNumber = uniqueCode.slice(1);

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
        studentNumber,
    };
};
