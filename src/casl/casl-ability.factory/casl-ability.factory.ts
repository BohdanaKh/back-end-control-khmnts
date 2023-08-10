import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { Advert } from '../../advert/advert.entity';
import Role from '../../users/roles/user.role.enum';
import { User } from '../../users/user.entity';
import { Action } from '../action.enum';

type Subjects = InferSubjects<typeof Advert | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    // if (user.role === 'Admin') {
    //   can(Action.Manage, 'all'); // read-write access to everything
    // } else if (user.role === 'Manager') {
    //   can(Action.Manage, 'all'); // read-write access to everything
    // } else if (user.role === 'User') {
    //   can(Action.Create && Action.Update, Advert && User); // create, update access to everything
    // } else {
    //   can(Action.Read, 'all'); // read-only access to everything
    // }
    //
    // can(Action.Update, Advert, {});
    // cannot(Action.Delete, Advert, { isPublished: true });

    if (user) {
      switch (user.role) {
        case Role.Admin:
          can(Action.Manage, 'all');
          can(Action.Create, User, { role: 'Manager' });
          break;
        case Role.Manager:
          can(Action.Manage, 'all');
          cannot(Action.Create, User, { role: 'Manager' });
          break;
        case Role.User:
          can(Action.Create && Action.Update && Action.Delete, Advert);
          break;
        default:
          can(Action.Read, 'all');
          break;
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
