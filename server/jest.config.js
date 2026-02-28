module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'SchedAI Server Test Report',
            outputPath: './test-report.html',
            includeFailureMsg: true,
            includeSuiteFailure: true,
            theme: 'darkTheme'
        }]
    ],
    collectCoverageFrom: [
        'BackendAndDB/controllers/**/*.js',
        'BackendAndDB/routes/**/*.js',
        '!BackendAndDB/controllers/inputDataSetGenerator.js',
        '!BackendAndDB/controllers/individualT*.js',
        '!BackendAndDB/controllers/scheduler_worker.exe'
    ]
};
