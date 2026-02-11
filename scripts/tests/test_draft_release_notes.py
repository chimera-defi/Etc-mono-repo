import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from draft_release_notes import (  # noqa: E402
    Commit,
    detect_breaking_change,
    extract_areas_from_files,
    filter_by_areas,
    group_commits,
    parse_conventional_subject,
)


class DraftReleaseNotesTests(unittest.TestCase):
    def test_parse_conventional_subject(self) -> None:
        commit_type, desc, breaking = parse_conventional_subject("feat(wallets)!: add hardware flow")
        self.assertEqual(commit_type, "feat")
        self.assertEqual(desc, "add hardware flow")
        self.assertTrue(breaking)

    def test_parse_non_conventional_subject(self) -> None:
        commit_type, desc, breaking = parse_conventional_subject("Update dependencies")
        self.assertEqual(commit_type, "other")
        self.assertEqual(desc, "Update dependencies")
        self.assertFalse(breaking)

    def test_detect_breaking_change_from_body(self) -> None:
        self.assertTrue(detect_breaking_change("feat: x", "BREAKING CHANGE: x", False))
        self.assertFalse(detect_breaking_change("feat: x", "normal body", False))

    def test_extract_areas_from_files(self) -> None:
        areas = extract_areas_from_files(["wallets/app.ts", "staking/contract.sol", "README.md"])
        self.assertEqual(areas, ("root", "staking", "wallets"))

    def test_filter_and_group(self) -> None:
        commits = [
            Commit(
                sha="a" * 40,
                short_sha="aaaaaaaa",
                subject="feat(wallets): add swap",
                body="",
                author="dev1",
                date="2026-02-11",
                files=("wallets/a.ts",),
                commit_type="feat",
                description="add swap",
                is_breaking=False,
                areas=("wallets",),
            ),
            Commit(
                sha="b" * 40,
                short_sha="bbbbbbbb",
                subject="fix(staking): patch bug",
                body="",
                author="dev2",
                date="2026-02-11",
                files=("staking/b.sol",),
                commit_type="fix",
                description="patch bug",
                is_breaking=False,
                areas=("staking",),
            ),
            Commit(
                sha="c" * 40,
                short_sha="cccccccc",
                subject="docs(wallets): update release process",
                body="",
                author="dev3",
                date="2026-02-11",
                files=("docs/release-notes.md", "wallets/README.md"),
                commit_type="docs",
                description="update release process",
                is_breaking=False,
                areas=("docs", "wallets"),
            ),
        ]
        filtered = filter_by_areas(commits, {"wallets"})
        self.assertEqual(len(filtered), 2)
        grouped = group_commits(filtered, {"wallets"})
        self.assertIn("wallets", grouped["feat"])
        self.assertEqual(grouped["feat"]["wallets"][0].description, "add swap")
        self.assertIn("wallets", grouped["docs"])
        self.assertNotIn("docs", grouped["docs"])


if __name__ == "__main__":
    unittest.main()
