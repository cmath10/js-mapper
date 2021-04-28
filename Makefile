.PHONY: dist
dist: ## Creates dist
	@docker-compose run --rm node yarn build
	@docker-compose run --rm node yarn declaration:build
	@echo "Done."

.PHONY: help
help: ## Lists recipes
	@echo "Recipes:"
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk '\
	    BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
