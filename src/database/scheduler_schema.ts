import {
  DataTypeBoolean,
  DataTypeEnum,
  DataTypeList,
  DataTypeMap,
  DataTypeString,
} from "../@foxlib/data-types";
import Model from "../@foxlib/model";

export const SchedulerModel = new Model(
  {
    uid: new DataTypeString(),
    tasks: new DataTypeList([
      new DataTypeMap({
        id: new DataTypeString(),
        title: new DataTypeString(),
        description: new DataTypeString(),
        /** Date start */
        task_add: new DataTypeString(),
        /** Date end */
        task_due: new DataTypeString(),
        status: new DataTypeEnum([ "Scheduled", "InProgress", "Completed", "Inactive" ], "Inactive"),
        type: new DataTypeEnum(["Birthday", "Reminder", "Mute", "Blocking", "Other"], "Other"),
        cid: new DataTypeString(),
        remaining_self: new DataTypeBoolean(false),
        content: new DataTypeString()
      })
    ])
  },
  {
    name: "schedulers",
    targets: [ "uid" ],
  }
);