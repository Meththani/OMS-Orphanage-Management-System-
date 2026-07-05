const mongoose = require('mongoose');
const User = require('../models/User');
const Donor = require('../models/Donor');
const { Donation, CashDonation, GoodsDonation, MealDonation } = require('../models/Donation');
const Child = require('../models/Child');
const MedicalRecord = require('../models/MedicalRecord');
const EducationRecord = require('../models/EducationRecord');
const BankAccount = require('../models/BankAccount');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const InventoryItem = require('../models/InventoryItem');
const Message = require('../models/Message');

const seedDatabase = async () => {
  try {
    // Check if seeding is already done (by checking if any users exist)
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping seeder...');
      return;
    }

    console.log('Seeding database with default accounts and mock data...');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'System Administrator',
      DOB: new Date('1990-01-01'),
      username: 'admin',
      password: 'password123',
      role: 'admin',
      contactDetails: '+1-555-0100',
      nic: '900010100V',
      jobRole: 'System Admin',
      department: 'IT & Administration',
    });

    const staffUser = await User.create({
      name: 'Sarah Smith',
      DOB: new Date('1994-05-15'),
      username: 'staff',
      password: 'password123',
      role: 'staff',
      contactDetails: '+1-555-0101',
      nic: '940515200V',
      jobRole: 'Senior Caregiver',
      department: 'Child Care',
    });

    const accountantUser = await User.create({
      name: 'Robert Accountant',
      DOB: new Date('1988-11-20'),
      username: 'accountant',
      password: 'password123',
      role: 'accountant',
      contactDetails: '+1-555-0102',
      nic: '881120300V',
      jobRole: 'Head Treasurer',
      department: 'Finance',
    });

    const donorUser = await User.create({
      name: 'John Donor',
      DOB: new Date('1985-03-25'),
      username: 'donor',
      password: 'password123',
      role: 'donor',
      contactDetails: '+1-555-0103',
      nic: '850325400V',
      jobRole: 'Philanthropist',
      department: 'External Relations',
    });

    console.log('Users seeded successfully.');

    // 2. Create Donor profile linked to donorUser
    const donorProfile = await Donor.create({
      donorID: 'DON-001',
      name: 'John Donor',
      contactDetails: '+1-555-0103',
      email: 'john.donor@example.com',
      type: 'individual',
      preference: 'cash',
      totalDonated: 500, // Seed total donation amount matching seeded donations
      linkedUser: donorUser._id,
    });

    console.log('Donor profile seeded successfully.');

    // 3. Create Children
    const tommyChild = await Child.create({
      childID: 'CHD-001',
      name: 'Tommy Oliver',
      DOB: new Date('2015-05-12'),
      gender: 'male',
      admissionDate: new Date('2022-01-10'),
      status: 'active',
      guardianInfo: {
        name: 'Rita Oliver',
        relation: 'Aunt',
        contact: '+1-555-0155',
      },
      bloodType: 'O+',
      allergies: 'Peanuts',
      assignedStaff: [staffUser._id],
    });

    const emilyChild = await Child.create({
      childID: 'CHD-002',
      name: 'Emily Vance',
      DOB: new Date('2018-09-20'),
      gender: 'female',
      admissionDate: new Date('2023-04-15'),
      status: 'active',
      guardianInfo: {
        name: 'David Vance',
        relation: 'Grandfather',
        contact: '+1-555-0188',
      },
      bloodType: 'A-',
      allergies: 'None',
      assignedStaff: [staffUser._id],
    });

    console.log('Children seeded successfully.');

    // 4. Create Medical Records
    await MedicalRecord.create({
      childID: tommyChild._id,
      recordDate: new Date('2026-01-15'),
      diagnosis: 'Common Cold',
      treatment: 'Rest, hydration, and paracetamol 250mg twice daily for 3 days.',
      doctorName: 'Dr. Ann Elizabeth',
    });

    await MedicalRecord.create({
      childID: tommyChild._id,
      recordDate: new Date('2026-05-10'),
      diagnosis: 'Sprained Ankle',
      treatment: 'Elastic bandage wrap, ice packs, elevated leg rest for 5 days.',
      doctorName: 'Dr. Ann Elizabeth',
    });

    await MedicalRecord.create({
      childID: emilyChild._id,
      recordDate: new Date('2026-06-05'),
      diagnosis: 'Routine Medical Checkup',
      treatment: 'Healthy. Growth charts and vaccination schedule up to date.',
      doctorName: 'Dr. Ann Elizabeth',
    });

    console.log('Medical records seeded successfully.');

    // 5. Create Education Records
    await EducationRecord.create({
      childID: tommyChild._id,
      schoolName: 'Hope Primary School',
      grade: 'Grade 4',
      status: 'enrolled',
    });

    await EducationRecord.create({
      childID: emilyChild._id,
      schoolName: 'Hope Kindergarten',
      grade: 'Preschool-2',
      status: 'enrolled',
    });

    console.log('Education records seeded successfully.');

    // 6. Create Donations
    // Cash Donation
    await CashDonation.create({
      donationID: 'DON-2026-001',
      donorID: donorProfile._id,
      date: new Date('2026-06-01'),
      status: 'received',
      receiptRef: 'REC-098273',
      notes: 'Initial monthly donation for general orphanage support.',
      recordedBy: accountantUser._id,
      amount: 500,
      paymentMethod: 'bank_transfer',
    });

    // Goods Donation
    await GoodsDonation.create({
      donationID: 'DON-2026-002',
      donorID: donorProfile._id,
      date: new Date('2026-06-15'),
      status: 'pending',
      notes: 'Textbooks and coloring sets for the upcoming semester.',
      recordedBy: staffUser._id,
      itemType: 'Education - Books & Stationery',
      quantity: 30,
    });

    // Meal Donation
    await MealDonation.create({
      donationID: 'DON-2026-003',
      donorID: donorProfile._id,
      date: new Date('2026-07-02'),
      status: 'received',
      notes: 'Seeded meal donation for the kids lunch.',
      recordedBy: adminUser._id,
      mealDate: new Date('2026-07-02'),
      mealType: 'lunch',
      quantity: 50,
    });

    console.log('Donations seeded successfully.');

    // == Seed Bank Accounts ==
    const cnbAccount = await BankAccount.create({
      accountName: 'General Operational Account',
      bankName: 'Ceylon National Bank',
      accountNumber: 'CNB-098273',
      initialBalance: 1250000,
      balance: 1250000 + 150000 - 183500, // initial + cash donation - expenses
    });

    const ccuAccount = await BankAccount.create({
      accountName: 'Reserve Trust Account',
      bankName: 'Community Credit Union',
      accountNumber: 'CCU-182736',
      initialBalance: 320000,
      balance: 320000,
    });

    console.log('Bank Accounts seeded.');

    // == Seed Income ==
    await Income.create({
      category: 'Public Donation',
      amount: 150000,
      paymentMethod: 'bank_transfer',
      donor: 'John Donor',
      refReceipt: 'REC-098273',
      bankAccount: cnbAccount._id,
      date: new Date('2026-06-01'),
    });

    console.log('Income seeded.');

    // == Seed Expenses ==
    await Expense.create({
      category: 'Utility Bills',
      staffName: 'Robert Accountant',
      referenceReceipt: 'EXP-REC-8827',
      amount: 18500,
      description: 'Monthly electricity and water bills payment.',
      bankAccount: cnbAccount._id,
      date: new Date('2026-06-10'),
    });

    await Expense.create({
      category: 'Food & Nutrition',
      staffName: 'Sarah Smith',
      referenceReceipt: 'EXP-REC-8828',
      amount: 45000,
      description: 'Bulk grocery purchase of rice, lentils, vegetables, and milk powder.',
      bankAccount: cnbAccount._id,
      date: new Date('2026-06-15'),
    });

    await Expense.create({
      category: 'Salaries',
      staffName: 'System Administrator',
      referenceReceipt: 'EXP-REC-8829',
      amount: 120000,
      description: 'Staff caregiver salaries distribution.',
      bankAccount: cnbAccount._id,
      date: new Date('2026-06-28'),
    });

    console.log('Expenses seeded.');

    // == Seed Inventory Items ==
    await InventoryItem.create([
      { name: 'Rice (Samba)', category: 'Food', quantity: 150, unit: 'kg' },
      { name: 'Dhal (Lentils)', category: 'Food', quantity: 45, unit: 'kg' },
      { name: 'Paracetamol 250mg', category: 'Medicine', quantity: 120, unit: 'boxes' },
      { name: 'Vitamin C 100mg', category: 'Medicine', quantity: 8, unit: 'bottles' }, // low-stock
      { name: 'Surgical Masks', category: 'Medicine', quantity: 0, unit: 'pieces' }, // out-of-stock
      { name: 'Exercise Notebooks (80 pages)', category: 'Education', quantity: 60, unit: 'pieces' },
      { name: 'Coloring Pencils (12-pack)', category: 'Education', quantity: 40, unit: 'boxes' },
      { name: 'Cotton T-shirts (Assorted)', category: 'Clothing', quantity: 25, unit: 'pieces' },
    ]);

    console.log('Inventory items seeded.');

    // == Seed Contact Messages ==
    await Message.create([
      {
        firstName: 'Amara',
        lastName: 'Dias',
        email: 'amara@example.com',
        phone: '+94771234567',
        message: 'Hi, I would like to visit the orphanage next Sunday with some gifts. Who should I contact to schedule this?',
        status: 'pending',
      },
      {
        firstName: 'Devinda',
        lastName: 'Silva',
        email: 'devinda.s@example.com',
        phone: '',
        message: 'Thank you for the wonderful work you are doing. I just set up a monthly donation transfer.',
        status: 'read',
      },
    ]);

    console.log('Contact messages seeded.');
    console.log('Database seeding process completed.');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

module.exports = seedDatabase;
