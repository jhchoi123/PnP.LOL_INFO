import { LolApiExecutor } from "../../functions/lol.mjs";
import { LolApiHostResolver } from "../../util/lol.mjs";
import Link from "next/link";
import HeadBase from "../../components/head";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const { name, host } = context.query; // get path parameter "name" and get query string "host"

  let flag = true;
  let user = null;
  let matches = null;
  // fetch user data from Riot API
  try {
    console.log(`user/[name].js: fetching user data: ${name} / ${host}`);
    user = await LolApiExecutor.getUserDataByName(name, host);
    console.log(`user/[name].js: successfully fetched user data: ${name} / ${host}`);
  } catch (e) {
    flag = false;
    console.log(`user/[name].js: failed to fetch user data: ${name} / ${host}`);
    console.log(e);
  }

  // convert platform host key to regional host key
  const regionalHost = LolApiHostResolver.getRegionalHostFromPlatform(host);

  // fetch match ids from Riot API
  try {
    console.log(`user/[name].js: fetching user match ids: ${name} / ${regionalHost}`);
    matches = await LolApiExecutor.getMatchIds(user.puuid, regionalHost, { count: 100 });
    console.log(`user/[name].js: successfully fetched match ids: ${name} / ${regionalHost}`);
  } catch (e) {
    flag = false;
    console.log(`user/[name].js: failed to fetch match ids: ${name} / ${regionalHost}`);
    console.log(e);
  }

  // pass data as props
  return { props: { data: { user, matches, flag, host } } };
}

// we can get props from getServerSideProps
export default function User({ data }) {
  const router = useRouter();
  const { name } = router.query;

  // if flag == false, error occurred when fetching data from api
  if (data.flag) {
    return (<>
      <HeadBase subTitle={`소환사 "${name}"`} />
      <main>
        <h1>USER PAGE</h1>
        <h2>TODO: Design Page Layout</h2>
        <h2>TODO: Implement - get match summary with match id</h2>

        <hr />

        <h2>User</h2>
        <p>
          summoner id: {data.user.id}
          <br />
          account id: {data.user.accoundId}
          <br />
          puuid: {data.user.puuid}
          <br />
          name: {data.user.name}
          <br />
          profile icon id: {data.user.profileIconId}
          <br />
          revision date: {new Date(data.user.revisionDate).toDateString()}
          <br />
          summoner level: {data.user.summonerLevel}
        </p>

        <hr />

        <h2>Matches (Match ID is Clickable)</h2>
        <ul>
          {data.matches.map((id) => (
            <li key={id}>
              <Link href={{
                pathname: `/match/${id}`,
                query: {
                  host: LolApiHostResolver.getRegionalHostFromPlatform(data.host)
                }
              }}>
                <a>
                  {id}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>);
  } else {
    return (<>
      <HeadBase subTitle={`소환사 "${name}"`} />
      <main>
        <h1>ERROR!</h1>
      </main>
    </>);
  }

}
