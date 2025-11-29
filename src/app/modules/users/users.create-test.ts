import { faker } from '@faker-js/faker';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, LoginType } from 'src/app/entities/user.entity';

export class UserTestDataGenerator {
  static generateUser(role?: UserRole): CreateUserDto & {
    dob?: Date;
    gender?: string;
    address?: string;
    avatar?: string;
    age?: number;
    phone?: string;
    loginType?: LoginType;
    verified?: boolean;
  } {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const dob = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
    const age = new Date().getFullYear() - dob.getFullYear();

    return {
      fullName,
      email,
      password: 'Password@123',
      role: role || faker.helpers.arrayElement([UserRole.USER, UserRole.INSTRUCTOR]),
      dob,
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      address: faker.location.streetAddress({ useFullAddress: true }),
      avatar: faker.image.avatar(),
      age,
      phone: `09${faker.string.numeric(8)}`,
      loginType: LoginType.LOCAL,
      verified: faker.datatype.boolean({ probability: 0.8 }),
    };
  }

  static generateUsers(
    quantity: number,
    role?: UserRole,
  ): (CreateUserDto & {
    dob?: Date;
    gender?: string;
    address?: string;
    avatar?: string;
    age?: number;
    phone?: string;
    loginType?: LoginType;
    verified?: boolean;
  })[] {
    const users = [];

    for (let i = 0; i < quantity; i++) {
      users.push(this.generateUser(role));
    }

    return users;
  }

  static generateVietnameseUser(role?: UserRole): CreateUserDto & {
    dob?: Date;
    gender?: string;
    address?: string;
    avatar?: string;
    age?: number;
    phone?: string;
    loginType?: LoginType;
    verified?: boolean;
  } {
    const vnFirstNames = [
      'Nguyễn',
      'Trần',
      'Lê',
      'Phạm',
      'Hoàng',
      'Huỳnh',
      'Phan',
      'Vũ',
      'Võ',
      'Đặng',
      'Bùi',
      'Đỗ',
      'Hồ',
      'Ngô',
      'Dương',
    ];

    const vnMiddleNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Thanh', 'Quốc', 'Anh', 'Hoàng'];

    const vnLastNamesMale = [
      'Hùng',
      'Dũng',
      'Tuấn',
      'Khoa',
      'Long',
      'Nam',
      'Phong',
      'Quân',
      'Thắng',
      'Việt',
      'Minh',
      'Hoàng',
      'Đạt',
      'Hải',
      'Tùng',
    ];

    const vnLastNamesFemale = [
      'Hương',
      'Linh',
      'Mai',
      'Nga',
      'Oanh',
      'Phương',
      'Quỳnh',
      'Thảo',
      'Trang',
      'Vy',
      'Anh',
      'Chi',
      'Hà',
      'Lan',
      'My',
    ];

    const vnCities = [
      'Hà Nội',
      'Hồ Chí Minh',
      'Đà Nẵng',
      'Hải Phòng',
      'Cần Thơ',
      'Biên Hòa',
      'Nha Trang',
      'Huế',
      'Vũng Tàu',
      'Buôn Ma Thuột',
    ];

    const gender = faker.helpers.arrayElement(['male', 'female']);
    const firstName = faker.helpers.arrayElement(vnFirstNames);
    const middleName = faker.helpers.arrayElement(vnMiddleNames);
    const lastName =
      gender === 'male'
        ? faker.helpers.arrayElement(vnLastNamesMale)
        : faker.helpers.arrayElement(vnLastNamesFemale);

    const fullName = `${firstName} ${middleName} ${lastName}`;
    const email = faker.internet
      .email({
        firstName: this.removeVietnameseTones(firstName),
        lastName: this.removeVietnameseTones(`${middleName}${lastName}`),
      })
      .toLowerCase();

    const dob = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
    const age = new Date().getFullYear() - dob.getFullYear();
    const city = faker.helpers.arrayElement(vnCities);

    return {
      fullName,
      email,
      password: 'Password@123',
      role: role || faker.helpers.arrayElement([UserRole.USER, UserRole.INSTRUCTOR]),
      dob,
      gender,
      address: `${faker.number.int({ min: 1, max: 999 })} ${faker.helpers.arrayElement(['Đường', 'Phố'])} ${faker.person.lastName()}, ${city}`,
      avatar: faker.image.avatar(),
      age,
      phone: `0${faker.helpers.arrayElement([3, 5, 7, 8, 9])}${faker.string.numeric(8)}`,
      loginType: LoginType.LOCAL,
      verified: faker.datatype.boolean({ probability: 0.8 }),
    };
  }

  static generateVietnameseUsers(
    quantity: number,
    role?: UserRole,
  ): (CreateUserDto & {
    dob?: Date;
    gender?: string;
    address?: string;
    avatar?: string;
    age?: number;
    phone?: string;
    loginType?: LoginType;
    verified?: boolean;
  })[] {
    const users = [];

    for (let i = 0; i < quantity; i++) {
      users.push(this.generateVietnameseUser(role));
    }

    return users;
  }

  private static removeVietnameseTones(str: string): string {
    const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ';
    const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';
    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(RegExp(from[i], 'gi'), to[i]);
    }
    return str;
  }
}
