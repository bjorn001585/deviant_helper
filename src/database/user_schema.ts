import {
  DataTypeBoolean,
  DataTypeEnum,
  DataTypeInt,
  DataTypeList,
  DataTypeMap,
  DataTypeString,
} from "../@foxlib/data-types";
import Model from "../@foxlib/model";

export const UserModel = new Model(
  {
    uid: new DataTypeString(),
    username: new DataTypeMap({
      discord: new DataTypeString(),
      minecraft: new DataTypeString(),
    }),
    about: new DataTypeMap({
      name: new DataTypeString(),
      birthday: new DataTypeString(),
      yourself: new DataTypeString(),
      purpose: new DataTypeString()
    }),
    friends: new DataTypeList([
      new DataTypeMap({
        id: new DataTypeString(),
        status: new DataTypeEnum(["friend", "best friend", "bro"], "friend"),
      }),
    ]),
    isVerfied: new DataTypeBoolean(false),
    dynamic: new DataTypeMap({
      messages: new DataTypeInt(0),
      welcome_count: new DataTypeInt(0),
      voice: new DataTypeMap({
        start: new DataTypeInt(0),
        end: new DataTypeInt(0),
        all_time: new DataTypeInt(0),
      }),
    }),
    warns: new DataTypeList([
      new DataTypeMap({
        timestamp: new DataTypeString(),
        moderator: new DataTypeString(),
        reason: new DataTypeString(),
        status: new DataTypeEnum(["active", "deactive", "unknown"], "unknown"),
      }),
    ]),
    clan: new DataTypeMap({
      id: new DataTypeInt(),
      status: new DataTypeEnum(["member", "owner", "absent"], "absent"),
    }),
    request: new DataTypeMap({
      status: new DataTypeEnum([ "approved", "pending", "rejected", "not sent" ], "not sent"),
      description: new DataTypeString()
    }),
    roles: new DataTypeList([
      new DataTypeString()
    ])
  },
  {
    name: "users",
    targets: ["uid"],
  }
);
