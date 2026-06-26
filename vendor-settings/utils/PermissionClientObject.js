import { getPermissionObject } from './config';

export const GetPermissionClientObject = (permissionName) => {
  try {
    let permissionObject = getPermissionObject();
    let permissions = permissionObject?.user_role?.permissions;
    const defaultPermissions = {
      VIEW_ADMIN_TOOLS: {
        status: permissions?.VIEW_ADMIN_TOOLS ? true : null,
        permission: permissions?.VIEW_ADMIN_TOOLS,
      },
      VIEW_ENTERPRISE_CREDITS: {
        status: permissions?.VIEW_ENTERPRISE_CREDITS ? true : null,
        permission: permissions?.VIEW_ENTERPRISE_CREDITS,
      },
      VIEW_ACCOUNT_SIDEBAR: {
        status: permissions?.VIEW_ACCOUNT_SIDEBAR ? true : null,
        permission: permissions?.VIEW_ACCOUNT_SIDEBAR,
      },
      VIEW_TEAM_CREDITS: {
        status: permissions?.VIEW_TEAM_CREDITS ? true : null,
        permission: permissions?.VIEW_TEAM_CREDITS,
      },
      GET_TEAM_LIST: {
        status: permissions?.GET_TEAM_LIST ? true : null,
        permission: permissions?.GET_TEAM_LIST,
      },
      RENAME_PROJECT_ALL: {
        status: permissions?.RENAME_PROJECT_ALL ? true : null,
        permission: permissions?.RENAME_PROJECT_ALL,
      },
      CHECK_INVENTORY_ACCESS: {
        status: permissions?.CHECK_INVENTORY_ACCESS ? true : null,
        permission: permissions?.CHECK_INVENTORY_ACCESS,
      },
      CHECK_INTEGRATION_ACCESS: {
        status: permissions?.CHECK_INTEGRATION_ACCESS ? true : null,
        permission: permissions?.CHECK_INTEGRATION_ACCESS,
      },
      VIEW_PRODUCT_ANALYTICS: {
        status: permissions?.VIEW_PRODUCT_ANALYTICS ? true : null,
        permission: permissions?.VIEW_PRODUCT_ANALYTICS,
      },
      DOWNLOAD_360: {
        status: permissions?.DOWNLOAD_360 ? true : null,
        permission: permissions?.DOWNLOAD_360,
      },
      VIEW_ENTERPRISE_DASHBOARD: {
        status: permissions?.VIEW_ENTERPRISE_DASHBOARD ? true : null,
        permission: permissions?.VIEW_ENTERPRISE_DASHBOARD,
      },
      VIEW_EXCEPTION_CONTRACTS: {
        status: permissions?.VIEW_EXCEPTION_CONTRACTS ? true : null,
        permission: permissions?.VIEW_EXCEPTION_CONTRACTS,
      },
      ADD_USER: {
        status: permissions?.ADD_USER ? true : null,
        permission: permissions?.ADD_USER,
      },
      MODIFY_USER_PASSWORD: {
        status: permissions?.MODIFY_USER_PASSWORD ? true : null,
        permission: permissions?.MODIFY_USER_PASSWORD,
      },
      VIEW_REVENUE_DASHBOARD: {
        status: permissions?.VIEW_REVENUE_DASHBOARD ? true : null,
        permission: permissions?.VIEW_REVENUE_DASHBOARD,
      },
      VIEW_DEVELOPER_HUB: {
        status: permissions?.VIEW_DEVELOPER_HUB ? true : null,
        permission: permissions?.VIEW_DEVELOPER_HUB,
      },
      VIEW_SETTING_TAB: {
        status: permissions?.VIEW_SETTING_TAB ? true : null,
        permission: permissions?.VIEW_SETTING_TAB,
      },
    };
    if (defaultPermissions[permissionName]) {
      return defaultPermissions[permissionName];
    } else if (permissions[permissionName]) {
      return {
        status: true,
        permission: permissions[permissionName],
      };
    }
    return {
      status: false,
      permission: null,
    };
  } catch (error) {
    console.error('Error in getPermissionClientObject:', error);
    return {};
  }
};
