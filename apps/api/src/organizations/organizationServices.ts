import { Organization } from "./organizationModel.ts";

import * as userSvc from "../user/userServices/userServices.ts";
import { Collection, ObjectId } from "mongodb";
import { PrixResponse } from "../types/responseModel.ts";
import { getDb } from "../mongo.ts";

function organizationCollection(): Collection<Organization> {
  return getDb().collection<Organization>("organizations");
}

// Read an Organization by user
/* export const readOrgById = async (orgId: string): Promise<PrixResponse> => {
  try {
    const organizations = organizationCollection();
    const org = await organizations.findOne({ _id: new ObjectId(orgId) });
    if (!org) {
      return { success: false, message: "Organization not found." };
    }

    const user = await userSvc.readUserById(org.userId);
    if (!user || (Array.isArray(user.role) ? !user.role.includes("Organization") : user.role !== "Organization")) {
      return { success: false, message: "Associated user not found or not an Organization." };
    }

    const merged = {
      _id: org._id,
      username: user.username,
      specialtyArt: org.specialtyArt,
      description: org.description,
      instagram: org.instagram,
      facebook: org.facebook,
      twitter: org.twitter,
      dateOfBirth: org.dateOfBirth,
      phone: org.phone,
      country: org.country,
      city: org.city,
      avatar: org.avatar,
      status: org.status,
      termsAgree: org.termsAgree,
      bio: org.bio,
      agreement: org.agreement,
    } as Organization;

    return {
      success: true,
      message: "Organization found.",
      result: merged,
    };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
};
 */
// Read all Organizations
export const readAllOrgFull = async (): Promise<PrixResponse> => {
  try {
    const organization = organizationCollection();
    const orgs = await organization.find({}).toArray();

    return {
      success: true,
      message: "Organizaciones disponibles.",
      result: orgs,
    };
  } catch (e) {
    return {
      success: false,
      message: (e as Error).message,
    };
  }
};


// Read Organization bio information for a user

/* export const readBio = async (username: string): Promise<PrixResponse> => {
  try {
    const organizations = organizationCollection();
    const u = await userSvc.readUserByUsername(username);
    if (!u || !u._id) {
      return { success: false, message: "User not found or user ID missing." };
    }
    const org = await organizations.findOne({ userId: u._id!.toString() });
    if (!org) {
      return { success: false, message: "Organization not found." };
    }
    return {
      success: true,
      message: "Bio loaded.",
      result: org.bio
    };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}; */

export const updateBio = async (orgId: string, data: { biography: string; images: string[] }): Promise<PrixResponse> => {
  try {
    const organizations = organizationCollection();
    const json = JSON.stringify(data);
    const upd = await organizations.findOneAndUpdate(
      { _id: new ObjectId(orgId) },
      { $set: { bio: json } },
      { returnDocument: "after" }
    );
    if (upd && !upd.description) {
      return { success: false, message: "Organization not found." };
    }
    return {
      success: true,
      message: "Actualización realizada con éxito.",
      result: upd!,
    };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
};
