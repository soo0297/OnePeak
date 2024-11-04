import { BlockedUserInfo } from "@/type";
import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { Tables } from "../../../database.types";
// import { v4 as uuidv4 } from "uuid";

type UserInfo = Tables<"user_info">;
const browserClient = createClient();

const errorFn = (error: PostgrestError | null, msg: string) => {
  console.log("Error", error?.message);
  throw new Error(msg);
};

// 전체 회원 데이터 가져오기
export const getUsersInfo = async (type: string, theNickname: string) => {
  if (type === "isBlocked") {
    const { data, error } = await browserClient
      .from("user_info")
      .select()
      .eq("is_blocked", true)
      .order("created_at", { ascending: false });
    if (error) errorFn(error, "차단 회원만 불러오는데 실패하였습니다");
    return data || [];
  }
  if (type === "isDeleted") {
    const { data, error } = await browserClient
      .from("user_info")
      .select()
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    if (error) errorFn(error, "탈퇴 회원만 불러오는데 실패하였습니다");
    return data || [];
  }
  if (type === "isAll") {
    const { data, error } = await browserClient.from("user_info").select().order("created_at", { ascending: false });
    if (error) errorFn(error, "모든 사용자들 정보를 가져오는데 실패하였습니다");
    return data || [];
  }
  if (type === "searchNickname" && theNickname) {
    const { data, error } = await browserClient
      .from("user_info")
      .select()
      .eq("nickname", theNickname)
      .order("created_at", { ascending: false });
    if (error) errorFn(error, "해당 회원을 검색하는데 실패하였습니다");
    return data || [];
  } else {
    const { data, error } = await browserClient.from("user_info").select().order("created_at", { ascending: false });
    if (error) errorFn(error, "사용자들 정보를 가져오는데 실패하였습니다");
    return data || [];
  }
};

// 특정 회원 차단 해제
export const unblock = async (targetUser: string) => {
  const { error } = await browserClient.from("user_info").update({ is_blocked: false }).eq("id", targetUser);
  if (error) errorFn(error, "해당 유저를 차단해제하는데 실패하였습니다");
};

// 특정 회원 차단
export const block = async (targetUser: string) => {
  console.log("aaa");
  console.log(targetUser);
  const { error } = await browserClient.from("user_info").update({ is_blocked: true }).eq("id", targetUser);
  if (error) errorFn(error, "해당 유저를 차단하는데 실패하였습니다");
};

// 특정 회원 탈퇴
export const cancle = async (targetUser: UserInfo) => {
  const { error } = await browserClient.from("user_info").update({ is_deleted: true }).eq("id", targetUser.id);
  if (error) errorFn(error, "해당 유저를 탈퇴시키는데 실패하였습니다");
};

// 특정 회원 재가입
export const uncancle = async (targetUser: UserInfo) => {
  const { error } = await browserClient.from("user_info").update({ is_deleted: false }).eq("id", targetUser.id);
  if (error) errorFn(error, "해당 유저를 재가입 시키는데 실패하였습니다");
};

// 블락 디테일
export const getBlockDetail = async (targetId: string) => {
  const { data, error } = await browserClient
    .from("block")
    .select(`*,user_info:user_info!block_target_id_fkey1(nickname)`)
    .order("created_at", { ascending: false });
  if (error) errorFn(error, "신고당한 유저를 불러오는데 실패하였습니다");

  // data가 존재할 경우에만 count를 계산
  const targetIdsCount: Record<string, number> = data
    ? data.reduce((acc, item) => {
        acc[item.target_id!] = (acc[item.target_id!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) // 초기값을 지정
    : {};
  // console.log(taregetIdsCount) // targetIdsCount={A:3, B:2, C:3,}

  const filteredTargetIds = data
    ? Object.entries(targetIdsCount)

        .filter((count) => {
          return count[1] >= 2;
        })
        .map(([id]) => id)
    : [];

  const filteredData = data?.filter((item) => {
    return item.target_id === targetId && filteredTargetIds.includes(item.target_id);
  });

  return filteredData || [];
};

export const getBlockTargetUsers = async () => {
  const { data, error } = await browserClient
    .from("block")
    .select(`target_id,user_info:user_info!block_target_id_fkey1(nickname,is_blocked)`)
    .order("created_at", { ascending: false })
    .returns<BlockedUserInfo[]>();

  if (error) {
    errorFn(error, "신고당한 유저를 불러오는데 실패하였습니다");
    return [];
  }

  // targetIdsCount를 객체 배열로 만들기
  const targetIdsCount = data?.reduce((acc, item) => {
    const existingEntry = acc.find((entry) => entry.id === item.target_id);
    if (existingEntry) {
      existingEntry.count += 1; // 기존 항목의 카운트 증가
    } else {
      acc.push({ id: item.target_id, count: 1 }); // 새 항목 추가
    }
    return acc;
  }, [] as Array<{ id: string; count: number }>); // 초기값을 객체 배열로 지정

  // 필터링 및 데이터 매핑
  const filteredData = targetIdsCount
    ?.filter(({ count }) => count >= 2)
    .map(({ id, count }) => {
      const item = data.find((d) => d.target_id === id);
      if (!item) return null;
      return {
        ...item,
        count, // 카운트 추가,
        user_info: {
          nickname: item.user_info.nickname,
          is_blocked: item.user_info.is_blocked
        }
      };
    });

  return filteredData || [];
};

// 언어 이미지 가져오기
export const getLanguageImg = async () => {
  const { data } = browserClient.storage.from("language-image").getPublicUrl("*");

  return data;
};

// 언어 가져오기
export const getLanguage = async () => {
  const { data, error } = await browserClient.from("language").select("langauge");
  if (error) errorFn(error, "언어 정보를 가져오는데 실패하였습니다");
  return data;
};

// 언어 이미지 버켓에 추가하기

// const checkFileExists = async (fileName: string) => {
//   const { data, error } = await browserClient.storage.from("language-image").list("", { search: fileName });

//   if (error) throw error;
//   return data && data.length > 0; // 파일이 존재하면 true 반환
// };

// export uploadLanguageImage = async (file) => {

//      // 파일 이름이 한글이라면 버켓에 추가되지 않음 -> 파일 이름을 UUID로 대체하고, 원래 파일의 확장자를 유지
//      const fileExtension = file.name.split(".").pop(); // 파일 확장자 추출
//      let encodedFileName = `${uuidv4{}}.${fileExtension}`;

//      // 파일이 이미 존재하는지 확인
//      const fileExists = await checkFileExists(encodedFileName);
//      if (fileExists) {
//        // 중복 파일명이 있으면, 새로운 UUID를 추가하여 고유 이름 보장
//        encodedFileName = `${uuidv4()}_${encodedFileName}`;
//      }

// }