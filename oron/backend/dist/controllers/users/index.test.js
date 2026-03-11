"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const supertest_1 = require("supertest");
const typeorm_1 = require("typeorm");
const dbCreateConnection_1 = require("orm/dbCreateConnection");
const User_1 = require("orm/entities/User");
const __1 = require("../..");
describe('Users', () => {
    let dbConnection;
    let userRepository;
    const userPassword = 'pass1';
    let adminUserToken = null;
    const adminUser = new User_1.User();
    adminUser.email = 'brandon.mayhew@test.com';
    adminUser.password = userPassword;
    adminUser.hashPassword();
    adminUser.role = 'ADMINISTRATOR';
    let standardUserToken = null;
    const standardUser = new User_1.User();
    standardUser.email = 'todd.alquist@test.com';
    standardUser.password = userPassword;
    standardUser.hashPassword();
    standardUser.role = 'STANDARD';
    before(async () => {
        dbConnection = await (0, dbCreateConnection_1.dbCreateConnection)();
        userRepository = (0, typeorm_1.getRepository)(User_1.User);
    });
    beforeEach(async () => {
        await userRepository.save([adminUser, standardUser]);
        let res = await (0, supertest_1.agent)(__1.app).post('/v1/auth/login').send({ email: adminUser.email, password: userPassword });
        adminUserToken = res.body.data;
        res = await (0, supertest_1.agent)(__1.app).post('/v1/auth/login').send({ email: standardUser.email, password: userPassword });
        standardUserToken = res.body.data;
    });
    afterEach(async () => {
        await userRepository.delete([adminUser.id, standardUser.id]);
    });
    describe('GET /v1/auth/users', () => {
        it('should get all users', async () => {
            const res = await (0, supertest_1.agent)(__1.app).get('/v1/users').set('Authorization', adminUserToken);
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body.message).to.equal('List of users.');
            (0, chai_1.expect)(res.body.data[3].email).to.eql('hank.schrader@test.com');
        });
        it('should report error of unauthorized user', async () => {
            const res = await (0, supertest_1.agent)(__1.app).get('/v1/users').set('Authorization', standardUserToken);
            (0, chai_1.expect)(res.status).to.equal(401);
            (0, chai_1.expect)(res.body.errorType).to.equal('Unauthorized');
            (0, chai_1.expect)(res.body.errorMessage).to.equal('Unauthorized - Insufficient user rights');
            (0, chai_1.expect)(res.body.errors).to.eql([
                'Unauthorized - Insufficient user rights',
                'Current role: STANDARD. Required role: ADMINISTRATOR',
            ]);
            (0, chai_1.expect)(res.body.errorRaw).to.an('null');
            (0, chai_1.expect)(res.body.errorsValidation).to.an('null');
        });
    });
    describe('GET /v1/auth/users//:id([0-9]+)', () => {
        it('should get user', async () => {
            const user = await userRepository.findOne({ email: adminUser.email });
            const res = await (0, supertest_1.agent)(__1.app).get(`/v1/users/${user.id}`).set('Authorization', adminUserToken);
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body.message).to.equal('User found');
            (0, chai_1.expect)(res.body.data.email).to.eql(adminUser.email);
        });
    });
});
//# sourceMappingURL=index.test.js.map