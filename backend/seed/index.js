const { User, GraduationRequest } = require('../models/index');
const { facultyData, officeDepts } = require('../data/masterData');
const { hashPassword, buildDefaultSteps, syncLegacyStepAliases, computeRequestStatus } = require('../middleware/helpers');

async function seedDatabase() {
    const adminHash = await hashPassword('admin1234');
    const officeHash = await hashPassword('office1234');
    const advisorHash = await hashPassword('a1234');
    const studentHash = await hashPassword('s1234');

    await User.findOrCreate({
        where: { email: 'admin@sskru.ac.th' },
        defaults: { id: 'admin', name: 'System Admin', password: adminHash, role: 'Admin' },
    });

    for (const dept of officeDepts) {
        const id = dept.toLowerCase().replace(/\s+/g, '_');
        await User.findOrCreate({
            where: { email: `office_${id}@sskru.ac.th` },
            defaults: { id: `office_${id}`, name: `เจ้าหน้าที่ ${dept}`, password: officeHash, role: 'Office', deptName: dept },
        });
    }

    let advisorCount = 101;
    let studentCount = 101;
    for (const faculty of facultyData) {
        for (const branch of faculty.branches) {
            const advisorId = `A1${advisorCount++}`;
            await User.findOrCreate({
                where: { email: `${advisorId}@sskru.ac.th` },
                defaults: { id: advisorId, name: `ที่ปรึกษา ${branch}`, password: advisorHash, role: 'Advisor', faculty: faculty.name, branch },
            });

            const studentId = `S1${studentCount++}`;
            await User.findOrCreate({
                where: { email: `${studentId}@sskru.ac.th` },
                defaults: { id: studentId, name: `นักศึกษา ${branch}`, password: studentHash, role: 'Student', faculty: faculty.name, branch },
            });
        }
    }

    const sampleStudents = await User.findAll({ where: { role: 'Student' }, order: [['id', 'ASC']], limit: 8 });
    const templates = [
        { academicYear: '2569', semester: '1', steps: { advisor: { status: 'approved', comment: 'ผ่านการตรวจสอบโดยที่ปรึกษา', updatedAt: new Date() } } },
        { academicYear: '2569', semester: '1', steps: { advisor: { status: 'approved', updatedAt: new Date() }, language_center: { status: 'approved', updatedAt: new Date() }, registration: { status: 'in_progress', updatedAt: new Date() } } },
        { academicYear: '2568', semester: '2', steps: { advisor: { status: 'approved', updatedAt: new Date() }, language_center: { status: 'approved', updatedAt: new Date() }, registration: { status: 'approved', updatedAt: new Date() }, activity_center: { status: 'approved', updatedAt: new Date() } } },
        { academicYear: '2568', semester: '2', steps: { advisor: { status: 'approved', updatedAt: new Date() }, language_center: { status: 'rejected', comment: 'ผลสอบภาษาไม่ถึงเกณฑ์', updatedAt: new Date() } } },
    ];

    for (let i = 0; i < sampleStudents.length; i++) {
        const student = sampleStudents[i];
        const t = templates[i % templates.length];
        const steps = syncLegacyStepAliases({ ...buildDefaultSteps(), ...t.steps });
        await GraduationRequest.findOrCreate({
            where: { studentId: student.id, academicYear: t.academicYear, semester: t.semester },
            defaults: { studentId: student.id, academicYear: t.academicYear, semester: t.semester, steps, status: computeRequestStatus(steps) },
        });
    }

    console.log('👤 Seed data ready:');
    console.log('   admin@sskru.ac.th / admin1234');
    console.log('   A1xx@sskru.ac.th / a1234');
    console.log('   S1xx@sskru.ac.th / s1234');
}

module.exports = { seedDatabase };
